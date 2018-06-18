package servlet;

import java.awt.Dimension;
import java.awt.Insets;
import java.awt.geom.Rectangle2D;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Properties;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.batik.bridge.BridgeContext;
import org.apache.batik.bridge.GVTBuilder;
import org.apache.batik.bridge.UserAgent;
import org.apache.batik.bridge.UserAgentAdapter;
import org.apache.batik.dom.svg.SAXSVGDocumentFactory;
import org.apache.batik.dom.svg.SVGDocumentFactory;
import org.apache.batik.gvt.GraphicsNode;
import org.apache.batik.transcoder.Transcoder;
import org.apache.batik.transcoder.TranscoderException;
import org.apache.batik.transcoder.TranscoderInput;
import org.apache.batik.transcoder.TranscoderOutput;
import org.apache.batik.transcoder.image.PNGTranscoder;
import org.freehep.graphicsbase.util.UserProperties;
import org.freehep.graphicsio.PageConstants;
import org.freehep.util.io.Base64OutputStream;
import org.w3c.dom.svg.SVGDocument;

/**
 * Batik Servlet
 */
@WebServlet("/BatikServlet")
public class BatikServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	private static final int NUMBER_PARAMETERS = 5;
	private static final String PARAMETER_SVG_STRING = "svgString";
	private static final String PARAMETER_FORMAT = "format";
	private static final String PARAMETER_MARGIN = "margin";
	private static final String PARAMETER_HEIGHT = "height";
	private static final String PARAMETER_WIDTH = "width";

	private static final Charset CHARSET = StandardCharsets.UTF_8;

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		
		// add x-origin header
		response.addHeader("Access-Control-Allow-Origin", "*");
		response.addHeader("Access-Control-Allow-Headers", "X-Requested-With");
		
		// retrieve parameter map
		Map<String, String[]> parameters = request.getParameterMap();
		
	    // read request
	    StringBuilder buffer = new StringBuilder();
	    BufferedReader reader = request.getReader();
	    String line;
	    while ((line = reader.readLine()) != null) {
	        buffer.append(line);
	    }
	    String body = buffer.toString();
		
	    // handle isAlive request
		if (body.equals("isAlive")) {
			response.getOutputStream().write("true".getBytes());
			return;
		}

		// read parameters
		if (parameters.size() < NUMBER_PARAMETERS)
			throw new ServletException("Illegal number of parameters provided, expected: " + NUMBER_PARAMETERS
					+ ", received: " + parameters.size());

		String svgString = null, format = null;
		int margin = 0, width = 0, height = 0;

		try {
			svgString = parameters.get(PARAMETER_SVG_STRING)[0];
			format = parameters.get(PARAMETER_FORMAT)[0];
			margin = Integer.parseInt(parameters.get(PARAMETER_MARGIN)[0]);
			width = Integer.parseInt(parameters.get(PARAMETER_WIDTH)[0]);
			height = Integer.parseInt(parameters.get(PARAMETER_HEIGHT)[0]);
		} catch (NumberFormatException e) {
			throw new ServletException("Parameter not of type integer", e);
		} catch (IndexOutOfBoundsException e) {
			throw new ServletException("No value for parameter provided", e);
		}

		if (svgString == null)
			throw new ServletException("No value for parameter " + PARAMETER_SVG_STRING + " provided");
		if (format == null)
			throw new ServletException("No value for parameter " + PARAMETER_FORMAT + " provided");

		// compute dimensions
		width = width + 2 * margin;
		height = height + 2 * margin;

		// convert the svg to the desired output format
		ByteArrayInputStream inStream = new ByteArrayInputStream(svgString.getBytes(CHARSET));
		OutputStream outstream = response.getOutputStream();
		File targetFile = new File("./graph.png");
		OutputStream fileOutStream = new FileOutputStream(targetFile);
		try {
			PNGTranscoder transcoder = new PNGTranscoder();
			transcoder.addTranscodingHint(PNGTranscoder.KEY_WIDTH, new Float(width));
			transcoder.addTranscodingHint(PNGTranscoder.KEY_HEIGHT, new Float(height));
			convertSvgToImage(inStream, fileOutStream, transcoder);
		} catch (TranscoderException e) {
			throw new ServletException("Unable to convert svg string to image", e);
		}
		
		response.setContentType("image/png");
		response.addHeader("Content-Disposition", "attachment; filename=graph.png");
		response.setContentLength((int) targetFile.length());
		
		FileInputStream fileInputStream = new FileInputStream(targetFile);
		int bytes;
		while ((bytes = fileInputStream.read()) != -1) {
			outstream.write(bytes);
		}
	}

	private void convertSvgToImage(final InputStream inStream, final OutputStream outStream,
			final Transcoder transcoder) throws TranscoderException {
		transcoder.transcode(new TranscoderInput(inStream), new TranscoderOutput(outStream));
	}
}
