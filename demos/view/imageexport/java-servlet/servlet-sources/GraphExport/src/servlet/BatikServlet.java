/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.4.
 ** Copyright (c) 2000-2021 by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ** yFiles demo files exhibit yFiles for HTML functionalities. Any redistribution
 ** of demo files in source code or binary form, with or without
 ** modification, is not permitted.
 **
 ** Owners of a valid software license for a yFiles for HTML version that this
 ** demo is shipped with are allowed to use the demo source code as basis
 ** for their own yFiles for HTML powered applications. Use of such programs is
 ** governed by the rights and conditions as set out in the yFiles for HTML
 ** license agreement.
 **
 ** THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED
 ** WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 ** MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 ** NO EVENT SHALL yWorks BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 ** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 ** TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 ** PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 ** LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 ** NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 ** SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **
 ***************************************************************************/
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
