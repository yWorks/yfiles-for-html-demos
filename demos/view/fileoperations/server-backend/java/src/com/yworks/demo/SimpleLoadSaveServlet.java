/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.
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
package com.yworks.demo;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import java.io.*;
import java.net.URLEncoder;
import java.util.NoSuchElementException;
import java.util.Scanner;

/**
 * This Servlet implements the load/save operations
 * Note that this servlet requires the Servlets 3.0 API for handling multipart form data.
 */
@MultipartConfig
public class SimpleLoadSaveServlet extends HttpServlet {

  private static final String FORM_INPUT_NAME = "demo-open-input";

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    handleRequest(req, resp);
  }

  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    handleRequest(req, resp);
  }

  /**
   * Dispatch the request depending on the invoked URL (poor man's REST)
   */
  private void handleRequest(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

    // allow cross-origin access (e.g. access localhost:8080 from a file:// URL)
    resp.setHeader("Access-Control-Allow-Origin", "*");

    String path = req.getServletPath();
    String action = path.substring(1);

    if("isAlive".equals(action)) {
      // Just check if the Server is alive to enable/disable the corresponding buttons on the client - reply "OK"
      resp.setStatus(200);
    } else if("load".equals(action)) {
      // Load a file from the local filesystem
      LoadGraph(req, resp);
    } else if("save".equals(action)) {
      // Save the graph to the local filesystem
      SaveGraph(req, resp);
    } else {
      resp.setStatus(400);
    }
  }

  /**
   * To save the graph, we just write the provided GraphML string to the response stream.
   */
  private void SaveGraph(final HttpServletRequest req, final HttpServletResponse resp) throws IOException {
    PrintStream printStream = null;
    try {
      String fn = req.getParameter("fn");
      String fileName = fn == null ? "graph.graphml" : fn;
      resp.setContentType("text/xml");
      resp.setHeader("Content-Disposition", "attachment; filename=\"" + fileName + "\"");
      String graph = req.getParameter("demo-input-graph");
      if(graph != null) {
        printStream = new PrintStream(resp.getOutputStream());
        printStream.print(graph);
      }
      resp.setStatus(200);
    } finally {
      if(printStream != null) {
        printStream.flush();
        printStream.close();
      }
    }
  }


  /**
   * Extracts the text content of the submitted file from the request, and
   * returns an HTML document that posts the URL-encoded text content to the iframe's parent window using
   * <code>window.postMessage()</code>.
   */
  private void LoadGraph(HttpServletRequest req, HttpServletResponse resp) {
    String message = "";
    try {
      Part filePart = req.getPart(FORM_INPUT_NAME);
      if(filePart == null) {
        message = "!ERROR! The specified file part of name '" + FORM_INPUT_NAME + "' was not found in the request.";
      } else {
        message = getStringContent(filePart.getInputStream());
      }
    } catch(Exception ex) {
      getServletContext().log("Could not process the request", ex);
      message = "!ERROR! Cannot process the request: " + ex.getMessage();
      resp.setStatus(400);
    }

    resp.setContentType("text/html");

    PrintWriter out = null;
    try {
      out = resp.getWriter();
      String encoded = encodeMessage(message);
      out.println("<html><head><script type='text/javascript'>"
              + "function onLoad() {\n"
              + "window.parent.postMessage(\"" + encoded + "\",\"*\") ;\n"
              + "}</script></head>"
              + "<body onload='onLoad();'></body></html>");
      resp.setStatus(200);
    } catch(IOException ex) {
      resp.setStatus(400);
      getServletContext().log("Response failed", ex);
    } finally {
      if(out != null) {
        out.close();
      }
    }
  }

  private static String getStringContent(java.io.InputStream is) {
    try {
      return new Scanner(is, "UTF-8").useDelimiter("\\A").next();
    } catch(NoSuchElementException e) {
      return "";
    }
  }

  private String encodeMessage(String message) throws UnsupportedEncodingException {
    // Unfortunately, URLEncode.encode() produces different results than JavaScript's encodeURIComponent
    // - fix this using some additional replacements.
    return URLEncoder.encode(message, "UTF-8").replaceAll("\\+", "%20")
            .replaceAll("\\%21", "!")
            .replaceAll("\\%27", "'")
            .replaceAll("\\%28", "(")
            .replaceAll("\\%29", ")")
            .replaceAll("\\%7E", "~");
  }
}
