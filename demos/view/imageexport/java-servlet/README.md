## Prerequisites

To start the server, first download [Apache Tomcat 8.0](https://tomcat.apache.org/download-80.cgi) and follow the install instructions.

To test a successful installation, open the command prompt, change directory to `TOMCAT-DIR/bin/` and run

```
\> catalina
```

If the installation was successful, the command should list several options.

## Compiling the Servlet

A [Java Development Kit](https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html) as well as the following dependencies are needed to compile the servlet:

- Vectorgraphics.jar - [vectorgraphics.jar](https://www.yworks.com/resources/libs/vectorgraphics.jar)
- Batik.jar - [batik.jar](https://www.yworks.com/resources/libs/batik.jar)

Please download the above libraries and copy them to `./servlet-sources/GraphExport/web/WEB-INF/lib/` directory.

To actually compile the servlet, open a command prompt and change directory to `./servlet-sources/GraphExport/src/servlet`.

Compile the Java servlet with its dependencies, i.e. Batik, Vectorgraphics and Apache Tomcat's Servlet-API:

```
\> javac -d "..\\..\\web\\WEB-INF\\classes" -classpath "TOMCAT-DIR\\lib\\servlet-api.jar;..\\..\\web\\WEB-INF\\lib\\batik.jar;..\\..\\web\\WEB-INF\\lib\\vectorgraphics.jar" BatikServlet.java
```

Then change directory to `./GraphExport/web/` and create a `.war` archive of the web application:

```
\> jar cvf BatikServlet.war .
```

## Running the Servlet

To run the a Tomcat server with this web application, copy `BatikServlet.war` to `TOMCAT-DIR/webapps/`. Then start the server from `TOMCAT-DIR/bin/` with

```
\> catalina run
```

This will deploy all web applications in `TOMCAT-DIR/webapps/`. The servlet is now listening on `http://localhost:8080/BatikServlet/BatikServlet`.
