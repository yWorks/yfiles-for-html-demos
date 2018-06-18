/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
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
'use strict'

define(['yfiles/view-component'], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * Creates a Voronoi diagram from a delauney triangulation. The result is returns as a sequence of
   * {@link yfiles.geometry.GeneralPath}s that define the Voronoi faces. This class is built upon the notions of
   * triangulations, planar embedding and faces and presupposes that the user is familiar with these notions.
   */
  class VoronoiDiagram {
    /**
     * Creates a new instance of Voronoidiagram
     * @param {Array} centroids
     * @param {yfiles.geometry.Rect} boundingBox
     */
    constructor(centroids, boundingBox) {
      this.centroids = centroids
      // calculate the content rect so that we can bound the Voronoi diagram
      this.boundingBox = boundingBox.toYRectangle()
      this.createVoronoiDiagram()
    }

    /**
     * Creates the Voronoi graph.
     * @return {yfiles.algorithms.Graph}
     */
    createVoronoiDiagram() {
      // create the delauney triangulation and get the created faces
      const delauney = this.createDelauneyTriangulation()
      const faces = delauney.faces
      const delauneyCoordinates = delauney.delauneyCoordinates
      const edge2face = delauney.edge2face

      // create the voronoiGraph
      const voronoiGraph = new yfiles.algorithms.Graph()
      // holds the voronoi node coordinates
      const voronoiNodeCoordinates = voronoiGraph.createNodeMap()

      const closestEdgesMap = new yfiles.collections.Map()
      let outerface

      const existOnlyTwoFaces = faces.size === 2
      let externalFaceFound = false
      faces.forEach(face => {
        // for each face, except the outerface add a Voronoi node for this face that lies on the faces circumcenter
        if (!face.outer || (existOnlyTwoFaces && externalFaceFound)) {
          const circumCenter = face.getCircumCenter()
          face.voronoiNode = this.createVoronoiNode(
            voronoiGraph,
            circumCenter,
            voronoiNodeCoordinates
          )

          // find the edge that is closer to the circumcenter
          // this is necessary to calculate afterwards the direction of the vertical lines
          const faceEdges = face.edges
          let minDist = Number.POSITIVE_INFINITY
          let closestEdge = null
          for (let i = 0; i < faceEdges.length; i++) {
            const edge = faceEdges[i]
            const edgeSource = voronoiNodeCoordinates.get(edge.source)
            const edgeTarget = voronoiNodeCoordinates.get(edge.target)

            const distance = yfiles.algorithms.Geom.distanceToLineSegment(
              circumCenter.x,
              circumCenter.y,
              edgeSource.x,
              edgeSource.y,
              edgeTarget.x,
              edgeTarget.y
            )
            if (distance < minDist) {
              minDist = distance
              closestEdge = edge
            }
          }
          closestEdgesMap.set(face, closestEdge)
        } else {
          // get the outerface
          outerface = face
          externalFaceFound = true
        }
      })

      const outerfaceEdges = new Set(outerface.edges)
      const visitedEdges = new Set()
      faces.forEach(face => {
        if (!face.outer || (existOnlyTwoFaces && face.circumCenter)) {
          const circumCenter = face.circumCenter
          face.edges.forEach(edge => {
            const oppositeEdge = edge.target.getEdge(edge.source)
            if (!visitedEdges.has(edge) && !visitedEdges.has(oppositeEdge)) {
              visitedEdges.add(edge)
              const sourceCenter = delauneyCoordinates.get(edge.source)
              const targetCenter = delauneyCoordinates.get(edge.target)

              // The Voronoi edges are drawn as follows:
              // (i) if the face edge is an outerface edge, we calculate the perpendicular vector to this edge from the
              // circumcenter (enlarge it enough so that it reaches the boundary and calculate the intersection point
              // (at this intersection point we draw a new Voronoi edge), (ii) if the circumcenter lies in the interior
              // of the triangle, we connect the two Voronoi nodes of the two involved faces - again we may have to
              // enlarge somehow the edge if this does not reach the boundary
              if (outerfaceEdges.has(edge) || outerfaceEdges.has(oppositeEdge)) {
                const v = new yfiles.algorithms.YVector(targetCenter, sourceCenter)

                // find the orthonormal vector
                let orthonormal = yfiles.algorithms.YVector.orthoNormal(v)
                orthonormal.scale(5000)

                // now we have to define the orthonormal vector's direction
                // we create a line-segment from the orthonormal and check if it intersects the triangle
                let point = yfiles.algorithms.YVector.add(circumCenter, orthonormal)
                const edgeSegment = new yfiles.algorithms.LineSegment(sourceCenter, targetCenter)
                const bisectorSegment = new yfiles.algorithms.LineSegment(point, circumCenter)
                const intersection = yfiles.algorithms.LineSegment.getIntersection(
                  edgeSegment,
                  bisectorSegment
                )
                // the circumcenter is internal and the line-segment does not intersect with the edge, we have to rotate
                if (face.isCircumCenterInternal() && !intersection) {
                  orthonormal = orthonormal.rotate(Math.PI)
                } else if (!face.isCircumCenterInternal()) {
                  // the circumcenter is not internal and there exists an intersection and the vertical line
                  // corresponds to the closest edge, or there exists not intersection but the vertical line does not
                  // correspond to the closest edge, we have to rotate
                  if (
                    (intersection && closestEdgesMap.get(face) === edge) ||
                    (!intersection && closestEdgesMap.get(face) !== edge)
                  ) {
                    orthonormal = orthonormal.rotate(Math.PI)
                  }
                }
                point = yfiles.algorithms.YVector.add(circumCenter, orthonormal)

                // calculate a new segment between the newly calculated point and the circumcenter and calculate the
                // intersection with the boundary
                if (this.boundingBox.contains(face.circumCenter)) {
                  const lineSegment = new yfiles.algorithms.LineSegment(face.circumCenter, point)
                  const intersectionPoints = this.calculateIntersectionPoints(lineSegment)
                  const newEdgeSource = face.voronoiNode
                  if (intersectionPoints.length > 0) {
                    const v1 = this.createVoronoiNode(
                      voronoiGraph,
                      intersectionPoints[0],
                      voronoiNodeCoordinates
                    )
                    this.createEdge(voronoiGraph, newEdgeSource, v1)
                  }
                } else if (closestEdgesMap.get(face) !== edge) {
                  let p = point
                  // if the circumcenter does not belong to the bounding box, we have to draw the vertical lines except
                  // the one that corresponds to the closest edge
                  if (!this.boundingBox.contains(point)) {
                    // we check if we have an intersection with the boundary, else we have to enlarge the segment
                    // enough, so that it reaches the boundary
                    if (
                      (face.circumCenter.x < point.x && face.circumCenter.x < this.boundingBox.x) ||
                      (face.circumCenter.x > point.x && face.circumCenter.x > this.boundingBox.x) ||
                      (face.circumCenter.y < point.y && face.circumCenter.y < this.boundingBox.y) ||
                      (face.circumCenter.y > point.y && face.circumCenter.y > this.boundingBox.y)
                    ) {
                      p = this.enlargeSegment(face.circumCenter, point)
                    } else {
                      p = this.enlargeSegment(point, face.circumCenter)
                    }
                  }

                  // then we take the two intersections... there must be two since one is the intersection with the
                  // closest boundary and the second with its parallel one
                  const lineSegment = new yfiles.algorithms.LineSegment(face.circumCenter, p)
                  const intersectionPoints = this.calculateIntersectionPoints(lineSegment)
                  if (intersectionPoints.length > 1) {
                    const v1 = this.createVoronoiNode(
                      voronoiGraph,
                      intersectionPoints[0],
                      voronoiNodeCoordinates
                    )
                    const v2 = this.createVoronoiNode(
                      voronoiGraph,
                      intersectionPoints[1],
                      voronoiNodeCoordinates
                    )
                    this.createEdge(voronoiGraph, v1, v2)
                  }
                }
              } else {
                const incidentFaces = edge2face.get(edge)
                const face1 = incidentFaces[0]
                const face2 = incidentFaces[1]

                // since the edge is not an outerface edge there always exist two faces, so we can create a segment
                let lineSegment = new yfiles.algorithms.LineSegment(
                  face1.circumCenter,
                  face2.circumCenter
                )
                const containsSource = this.boundingBox.contains(face1.circumCenter)
                const containsTarget = this.boundingBox.contains(face2.circumCenter)

                let newEdgeSource = face1.voronoiNode
                let newEdgeTarget = face2.voronoiNode
                if (containsSource && containsTarget) {
                  // if both endpoints belong to the bounding box, we can simply create an edge
                  this.createEdge(voronoiGraph, newEdgeSource, newEdgeTarget)
                } else {
                  // if both endpoints does not belong to the bounding box, possibly the segment needs enlargement if
                  // e.g. two points are both on the left or on the right of the rectangle
                  let p1 = face1.circumCenter
                  let p2 = face2.circumCenter

                  const x1 = this.boundingBox.x
                  const x2 = x1 + this.boundingBox.width
                  const y1 = this.boundingBox.y
                  const y2 = y1 + this.boundingBox.height
                  const bothAtTheSameSide =
                    (p1.x <= x1 && p2.x <= x1) ||
                    (p1.y <= y1 && p2.y <= y1) ||
                    (p1.x >= x2 && p2.x >= x2) ||
                    (p1.y >= y2 && p2.y >= y2)

                  if (!bothAtTheSameSide) {
                    if (!containsSource) {
                      p1 = this.enlargeSegment(face2.circumCenter, face1.circumCenter)
                    }
                    if (!containsTarget) {
                      p2 = this.enlargeSegment(face1.circumCenter, face2.circumCenter)
                    }

                    lineSegment = new yfiles.algorithms.LineSegment(p1, p2)
                    const intersectionPoints = this.calculateIntersectionPoints(lineSegment)
                    if (!containsSource) {
                      newEdgeSource = this.createVoronoiNode(
                        voronoiGraph,
                        intersectionPoints[0],
                        voronoiNodeCoordinates
                      )
                    }

                    if (!containsTarget) {
                      newEdgeTarget = this.createVoronoiNode(
                        voronoiGraph,
                        intersectionPoints.length === 1
                          ? intersectionPoints[0]
                          : intersectionPoints[1],
                        voronoiNodeCoordinates
                      )
                    }
                    this.createEdge(voronoiGraph, newEdgeSource, newEdgeTarget)
                  } else {
                    // create a node for the one that is closer to the boundary
                    const rect = this.boundingBox.toRect()
                    const isP1CloserToBoundary =
                      rect.distanceTo(p1.toPoint()) < rect.distanceTo(p2.toPoint())
                    if (isP1CloserToBoundary) {
                      p1 = this.enlargeSegment(face2.circumCenter, face1.circumCenter)
                    } else {
                      p2 = this.enlargeSegment(face1.circumCenter, face2.circumCenter)
                    }

                    lineSegment = new yfiles.algorithms.LineSegment(p1, p2)
                    const intersectionPoints = this.calculateIntersectionPoints(lineSegment)
                    if (intersectionPoints.length > 0) {
                      this.createVoronoiNode(
                        voronoiGraph,
                        intersectionPoints[0],
                        voronoiNodeCoordinates
                      )
                    }
                  }
                }
              }
            }
          })
        }
      })

      // add the boundary nodes - needed mostly for coloring the Voronoi parts
      const x = this.boundingBox.x
      const y = this.boundingBox.y
      const width = this.boundingBox.width
      const height = this.boundingBox.height

      this.createVoronoiNode(
        voronoiGraph,
        new yfiles.algorithms.YPoint(x, y),
        voronoiNodeCoordinates
      )
      this.createVoronoiNode(
        voronoiGraph,
        new yfiles.algorithms.YPoint(x + width, y),
        voronoiNodeCoordinates
      )
      this.createVoronoiNode(
        voronoiGraph,
        new yfiles.algorithms.YPoint(x + width, y + height),
        voronoiNodeCoordinates
      )
      this.createVoronoiNode(
        voronoiGraph,
        new yfiles.algorithms.YPoint(x, y + height),
        voronoiNodeCoordinates
      )

      // determine which nodes of the graph belong to the boundary so that we connect the consecutive ones and create
      // the Voronoi areas
      const boundaryNodes = []
      voronoiGraph.nodes.forEach(node => {
        if (this.belongsToBoundary(voronoiNodeCoordinates.get(node))) {
          boundaryNodes.push(node)
        }
      })

      // sort the nodes around the boundary so that we add edges between these nodes
      const center = new yfiles.algorithms.YPoint(x + width * 0.5, y + height * 0.5)
      boundaryNodes.sort((n1, n2) => {
        const p1 = voronoiNodeCoordinates.get(n1)
        const p2 = voronoiNodeCoordinates.get(n2)
        let angle1 = Math.atan2(p1.y - center.y, p1.x - center.x)
        let angle2 = Math.atan2(p2.y - center.y, p2.x - center.x)

        if (angle1 < 0) {
          angle1 += 2 * Math.PI
        }

        if (angle2 < 0) {
          angle2 += 2 * Math.PI
        }

        // For counter-clockwise, just reverse the signs of the return values
        if (angle1 < angle2) {
          return 1
        } else if (angle2 < angle1) {
          return -1
        }
        return 0
      })

      // create the edges between consecutive boundary nodes and store them
      const boundaryEdges = []
      for (let i = 0; i < boundaryNodes.length; i++) {
        const additionalNode = boundaryNodes[i]
        const edge = this.createEdge(
          voronoiGraph,
          boundaryNodes[(i + 1) % boundaryNodes.length],
          additionalNode
        )
        if (edge) {
          boundaryEdges.push(edge)
        }
      }

      // remove nodes that might lie on the exterior of the graph's bounding box, these can occur only if a
      // circumcenter lies on the exterior of the bounding box after the triangulation
      voronoiGraph.nodes.toArray().forEach(node => {
        if (node.degree === 0) {
          voronoiGraph.removeNode(node)
        }
      })

      // calculate the Voronoi faces
      this.calculateVoronoiFaces(voronoiGraph, voronoiNodeCoordinates, boundaryEdges)
    }

    /**
     * Creates the delauney triangulation and returns an object containing information about the created faces.
     * @return {Object}
     */
    createDelauneyTriangulation() {
      // generate the delauney triangulation - the nodes of the delauney graph are the center of the clusters
      const delauneyGraph = new yfiles.algorithms.Graph()
      // holds the coordinates of each delauney node
      const pointData = delauneyGraph.createNodeMap()
      // holds the reversed edge for each delauney edge
      const revMap = delauneyGraph.createEdgeMap()

      // fill the pointData with the coordinates of the nodes of the delauney graph
      for (let i = 0; i < this.centroids.length; i++) {
        const centroid = this.centroids[i]
        const center = delauneyGraph.createNode()
        pointData.set(center, new yfiles.algorithms.YPoint(centroid.x, centroid.y))
      }

      // create the delauney triangulation
      const outerfaceEdge = yfiles.algorithms.Triangulator.calcDelauneyTriangulation(
        delauneyGraph,
        pointData,
        revMap
      )

      // calculate the faces of the triangulation
      const edge2face = yfiles.algorithms.Maps.createHashedEdgeMap()
      const faces = this.calculateDelauneyFaces(delauneyGraph, revMap, pointData, edge2face)

      // mark outerface edges
      this.calculateOuterface(outerfaceEdge, revMap, edge2face)
      return {
        faces,
        delauneyCoordinates: pointData,
        edge2face
      }
    }

    /**
     * Calculates the faces of the given graph.
     * @param {yfiles.algorithms.Graph} graph The input graph
     * @param {yfiles.algorithms.IEdgeMap} reversedEdgesMap An edge map that holds for each edge the corresponding
     * reversed edge
     * @param {yfiles.algorithms.INodeMap} coordinatesMap A node map that holds for each node the corresponding node
     * coordinates
     * @param {yfiles.algorithms.IEdgeMap} edge2face An edge map that holds for each edge the face(s) to which the edge
     * belongs
     * @return {yfiles.algorithms.YList} The faces of the given graph as list
     */
    calculateDelauneyFaces(graph, reversedEdgesMap, coordinatesMap, edge2face) {
      const mark = []
      const faceList = new yfiles.algorithms.YList()
      graph.edges.forEach(edge => {
        if (!mark[edge.index]) {
          const face = this.createFace(edge, mark, reversedEdgesMap)
          faceList.add(face)
          face.nodeCoordinates = coordinatesMap
        }
      })

      faceList.forEach(face => {
        face.edges.forEach(edge => {
          this.addEdgeToFace(edge, face, edge2face)
          this.addEdgeToFace(reversedEdgesMap.get(edge), face, edge2face)
        })
      })
      return faceList
    }

    /**
     * Calculates the outerface, starting from a given outerface edge.
     * @param {yfiles.algorithms.Edge} outerfaceEdge An edge of the outerface to start
     * @param {yfiles.algorithms.IEdgeMap} reversedEdgesMap An edge map that holds for each edge the corresponding
     * reversed edge belongs
     * @param {yfiles.algorithms.IEdgeMap} edge2face An edge map that holds for each edge the face(s) to which the
     * edge belongs
     */
    calculateOuterface(outerfaceEdge, reversedEdgesMap, edge2face) {
      let eOut = outerfaceEdge
      const outerfaceEdges = new Set()
      const outerFaceMark = []
      do {
        outerFaceMark[eOut.index] = true
        eOut = this.cyclicNextEdge(eOut, reversedEdgesMap)
        outerfaceEdges.add(eOut)
        outerfaceEdges.add(reversedEdgesMap.get(eOut))
      } while (outerfaceEdge !== eOut)

      // define the outerface, it is the face that contains the edge returned by the delauney triangulation
      const outerEdgeFaces = edge2face.get(outerfaceEdge)
      let outerface = null
      for (let j = 0; j < outerEdgeFaces.length; j++) {
        const face = outerEdgeFaces[j]
        let includedEdges = 0
        const faceEdges = face.edges
        for (let i = 0; i < faceEdges.length; i++) {
          const edge = faceEdges[i]
          if (outerfaceEdges.has(edge)) {
            includedEdges++
          } else {
            break
          }
          if (includedEdges === faceEdges.length) {
            outerface = face
            // mark the face as outerface
            outerface.outer = true
            break
          }
        }
      }
    }

    /**
     * Creates a new face starting from the given edge.
     * @param {yfiles.algorithms.Edge} edge The edge to start
     * @param {Array} mark Holds the edges that have already been visited
     * @param {yfiles.algorithms.IEdgeMap} reversedEdgesMap An edge map that holds for each edge the corresponding
     * reversed edge
     * @return {Face}
     */
    createFace(edge, mark, reversedEdgesMap) {
      const face = new Face()
      const startEdge = edge
      let ok = true
      while (ok) {
        face.addEdge(edge)
        mark[edge.index] = true

        // select the next outgoing edge in counterclockwise direction
        const nextEdge = this.cyclicNextEdge(edge, reversedEdgesMap)
        if (mark[nextEdge.index]) {
          if (nextEdge === startEdge) {
            ok = false
          }
        }
        edge = nextEdge
      }
      return face
    }

    /**
     * Adds an edge to the given face.
     * @param {yfiles.algorithms.Edge} edge The given edge
     * @param {Face} face The face to which the edge belongs
     * @param {yfiles.algorithms.IEdgeMap} edge2face An edge map that holds for each edge the face(s) to which the edge
     * belongs
     */
    addEdgeToFace(edge, face, edge2face) {
      if (!edge2face.get(edge)) {
        edge2face.set(edge, [])
      }
      const faces = edge2face.get(edge)
      if (faces.indexOf(face) < 0) {
        faces.push(face)
      }
    }

    /**
     * Returns the next edge in the face.
     * @param {yfiles.algorithms.Edge} edge The given edge
     * @param {yfiles.algorithms.IEdgeMap} reversedEdgesMap An edge map that holds for each edge the corresponding
     * reversed edge
     * @return {yfiles.algorithms.Edge} The next edge in the face
     */
    cyclicNextEdge(edge, reversedEdgesMap) {
      const reversedEdge = reversedEdgesMap.get(edge)
      const result = reversedEdge.prevOutEdge
      return result === null ? reversedEdge.source.lastOutEdge : result
    }

    /**
     * Returns the previous edge in the face.
     * @param {yfiles.algorithms.Edge} edge The given edge
     * @param {yfiles.algorithms.IEdgeMap} reversedEdgesMap An edge map that holds for each edge the corresponding
     * reversed edge
     * @return {yfiles.algorithms.Edge} The previous edge in the face
     */
    cyclicPrevEdge(edge, reversedEdgesMap) {
      let tmp = edge.nextOutEdge
      if (tmp == null) {
        tmp = edge.source.firstOutEdge
      }
      return reversedEdgesMap.get(tmp)
    }

    /**
     * Creates a Voronoi node.
     * @param {yfiles.algorithms.Graph} voronoiGraph The Voronoi graph
     * @param {yfiles.algorithms.YPoint} coordinates The node coordinates
     * @param {yfiles.algorithms.INodeMap} voronoiNodeCoordinates Holds the coordinates of the nodes of the Voronoi
     * graph
     * @return {yfiles.algorithms.Node}
     */
    createVoronoiNode(voronoiGraph, coordinates, voronoiNodeCoordinates) {
      const voronoiNode = voronoiGraph.createNode()
      voronoiNodeCoordinates.set(voronoiNode, coordinates)
      return voronoiNode
    }

    /**
     * Creates an edge between the two given nodes if the edge does not already exist in the graph.
     * @param {yfiles.algorithms.Node} source The source of the edge
     * @param {yfiles.algorithms.Node} target The target of the edge
     * @return {yfiles.algorithms.Edge}
     */
    createEdge(voronoiGraph, source, target) {
      if (
        !voronoiGraph.containsEdge(source, target) &&
        !voronoiGraph.containsEdge(target, source)
      ) {
        return voronoiGraph.createEdge(source, target)
      }
      return null
    }

    /**
     * Calculates the faces of the Voronoi graph.
     * @param {yfiles.algorithms.Graph} voronoiGraph The Voronoi graph
     * @param {yfiles.algorithms.INodeMap} voronoiNodeCoordinates Holds the coordinates of the nodes of the Voronoi
     * graph
     * @param {Array} boundaryEdges An array containing the edges that belong to the boundary
     */
    calculateVoronoiFaces(voronoiGraph, voronoiNodeCoordinates, boundaryEdges) {
      const darts = []
      const node2Darts = new yfiles.collections.Map()
      const boundaryEdgesSet = new Set(boundaryEdges)

      // for each edge segment, we create two darts, one for each direction s -> t and t -> s
      let index = -1
      voronoiGraph.edges.forEach(edge => {
        const source = edge.source
        const target = edge.target
        const dart1 = new Dart(source, target, edge, index++)
        darts.push(dart1)
        const dart2 = new Dart(target, source, edge, index++)
        darts.push(dart2)

        // store the dart to its origin node's list
        if (!node2Darts.get(source)) {
          node2Darts.set(source, [])
        }
        node2Darts.get(source).push(dart1)

        if (!node2Darts.get(target)) {
          node2Darts.set(target, [])
        }
        node2Darts.get(target).push(dart2)

        dart1.reversed = dart2
        dart2.reversed = dart1
      })

      // for each dart, we calculate the angle that creates with the x-axis in counter-clockwise order
      darts.forEach(dart => {
        const sourceCenter = voronoiNodeCoordinates.get(dart.source)
        const targetCenter = voronoiNodeCoordinates.get(dart.target)
        const angle = Math.atan2(sourceCenter.y - targetCenter.y, sourceCenter.x - targetCenter.x)
        dart.angle = angle > 0 ? angle : 2 * Math.PI + angle
      })

      // we sort the darts around their origin based on the angle the form with the x-axis
      voronoiGraph.nodes.forEach(node => {
        const nodeDarts = node2Darts.get(node)
        nodeDarts.sort((dart1, dart2) => {
          if (dart1.angle < dart2.angle) {
            return -1
          } else if (dart1.angle > dart2.angle) {
            return 1
          }
          return 0
        })
        for (let i = 0; i < nodeDarts.length; i++) {
          const dart = nodeDarts[i]
          dart.next = nodeDarts[(i + 1) % nodeDarts.length]
        }
      })

      // we iterate over the darts to create the faces
      const faces = []
      darts.forEach(dart => {
        const face = []
        if (!dart.marked) {
          let d = dart
          while (!d.marked) {
            d.marked = true
            face.push(d)
            // get the next dart of the reversed
            d = d.reversed.next
          }
          // if the face is not the outer face, add the face to the list
          if (face.length !== boundaryEdges.length) {
            faces.push(face)
          } else {
            // if the sizes are equal, we have to examine whether the face contains all edges of the outer face
            for (let i = 0; i < face.length; i++) {
              const faceDart = face[i]
              // if an edge is not included this means that the face is not the same as the outerface
              if (!boundaryEdgesSet.has(faceDart.associatedEdge)) {
                faces.push(face)
                break
              }
            }
          }
        }
      })

      // we create the general paths that form the geometric face
      const voronoiFaces = []
      faces.forEach(face => {
        if (face.length > 2) {
          const facePath = new yfiles.geometry.GeneralPath()
          for (let i = 0; i < face.length - 1; i++) {
            const dart = face[i]
            const sourcePoint = voronoiNodeCoordinates.get(dart.source)
            const targetPoint = voronoiNodeCoordinates.get(dart.target)
            if (i === 0) {
              facePath.moveTo(sourcePoint.x, sourcePoint.y)
            }
            facePath.lineTo(targetPoint.x, targetPoint.y)
          }
          facePath.close()
          voronoiFaces.push(facePath)
        }
      })

      this.voronoiFaces = voronoiFaces
    }

    /**
     * Calculates the intersections between the bounding box and a line segment.
     * @param {yfiles.algorithms.LineSegment} lineSegment The given line segment
     * @return {Array} An array containing the intersections between a rectangle and a line segment
     */
    calculateIntersectionPoints(lineSegment) {
      const v1 = new yfiles.algorithms.YPoint(this.boundingBox.x, this.boundingBox.y)
      const v2 = new yfiles.algorithms.YPoint(
        this.boundingBox.x + this.boundingBox.width,
        this.boundingBox.y
      )
      const v3 = new yfiles.algorithms.YPoint(
        this.boundingBox.x + this.boundingBox.width,
        this.boundingBox.y + this.boundingBox.height
      )
      const v4 = new yfiles.algorithms.YPoint(
        this.boundingBox.x,
        this.boundingBox.y + this.boundingBox.height
      )

      const intersections = []
      let intersectionPoint = yfiles.algorithms.LineSegment.getIntersection(
        lineSegment,
        new yfiles.algorithms.LineSegment(v1, v2)
      )
      if (intersectionPoint) {
        intersections.push(intersectionPoint)
      }

      intersectionPoint = yfiles.algorithms.LineSegment.getIntersection(
        lineSegment,
        new yfiles.algorithms.LineSegment(v2, v3)
      )
      if (intersectionPoint) {
        intersections.push(intersectionPoint)
      }

      intersectionPoint = yfiles.algorithms.LineSegment.getIntersection(
        lineSegment,
        new yfiles.algorithms.LineSegment(v3, v4)
      )
      if (intersectionPoint) {
        intersections.push(intersectionPoint)
      }

      intersectionPoint = yfiles.algorithms.LineSegment.getIntersection(
        lineSegment,
        new yfiles.algorithms.LineSegment(v4, v1)
      )
      if (intersectionPoint) {
        intersections.push(intersectionPoint)
      }
      return intersections
    }

    /**
     * Enlarges the segment formed by the two given points from the side of the second point.
     * @param {yfiles.algorithms.YPoint} p1 The first point of the line segment
     * @param {yfiles.algorithms.YPoint} p2 The second point of the line segment
     * @return {yfiles.algorithms.YPoint} A new point from the side of the second point
     */
    enlargeSegment(p1, p2) {
      const alpha = Math.atan2(p1.y - p2.y, p1.x - p2.x)
      const x = p2.x - 100000 * Math.cos(alpha)
      const y = p2.y - 100000 * Math.sin(alpha)
      return new yfiles.algorithms.YPoint(x, y)
    }

    /**
     * Checks whether this point belongs on the bounding box.
     * @param {yfiles.algorithms.YPoint} point The point to check
     * @return {boolean} True if the point belongs on the boundary, false otherwise
     */
    belongsToBoundary(point) {
      return (
        Math.abs(point.x - this.boundingBox.x) < 0.001 ||
        Math.abs(point.x - this.boundingBox.x - this.boundingBox.width) < 0.001 ||
        Math.abs(point.y - this.boundingBox.y) < 0.001 ||
        Math.abs(point.y - this.boundingBox.y - this.boundingBox.height) < 0.001
      )
    }
  }

  /**
   * This class represents a dart used for calculating the faces of a given graph drawing. For each edge there exist
   * two darts, one that represents the edge in its original direction (i.e., from source to target) and one that
   * represents its reverse.
   */
  class Dart {
    /**
     * Creates a new instance of Dart
     * @param {yfiles.algorithms.Node} source
     * @param {yfiles.algorithms.Node} target
     * @param {yfiles.algorithms.Edge} associatedEdge
     * @param {number} index
     */
    constructor(source, target, associatedEdge, index) {
      this.source = source
      this.target = target
      this.associatedEdge = associatedEdge
      this.index = index
      this.$next = null
      this.$marked = false
      this.$reversed = null
      this.$angle = null
    }

    /**
     * Gets the next dart in counter-clockwise order.
     * @return {Dart} The next dart
     */
    get next() {
      return this.$next
    }

    /**
     * Sets the next dart in counter-clockwise order.
     * @param {Dart} next The next dart
     */
    set next(next) {
      this.$next = next
    }

    /**
     * Gets whether or not this dart is marked.
     * @return {Boolean} True if this dart is marked, false otherwise
     */
    get marked() {
      return this.$marked
    }

    /**
     * Sets whether this dart is marked.
     * @param {Boolean} marked True if this dart is marked, false otherwise
     */
    set marked(marked) {
      this.$marked = marked
    }

    /**
     * Gets the reversed dart for this dart.
     * @return {Dart} The reversed dart
     */
    get reversed() {
      return this.$reversed
    }

    /**
     * Sets the reversed dart for this dart.
     * @param {Dart} reversed The reversed dart
     */
    set reversed(reversed) {
      this.$reversed = reversed
    }

    /**
     * Gets the angle formed by this dart in counter-clockwise order.
     * @return {number} The dart's angle
     */
    get angle() {
      return this.$angle
    }

    /**
     * Sets the angle formed by this dart in counter-clockwise order.
     * @param {number} angle The dart's angle
     */
    set angle(angle) {
      this.$angle = angle
    }
  }

  /**
   * This class models a triangular face.
   */
  class Face {
    constructor() {
      this.$voronoiNode = null
      this.$edges = []
      this.vertices = []
      this.$circumCenter = null
      this.$nodeCoordinates = null
      this.$outer = false
    }

    /**
     * Gets the node map containing the coordinates of the nodes of the faces.
     * @return {yfiles.algorithms.INodeMap} The node map containing the coordinates of the nodes of the faces
     */
    get nodeCoordinates() {
      return this.$nodeCoordinates
    }

    /**
     * Sets the node map containing the coordinates of the nodes of the faces.
     * @param {yfiles.algorithms.INodeMap} value The node map containing the coordinates of the nodes of the faces.
     */
    set nodeCoordinates(value) {
      this.$nodeCoordinates = value
    }

    /**
     * Gets the circumcenter of the face.
     * @return {yfiles.algorithms.YPoint} The circumcenter of the face.
     */
    get circumCenter() {
      return this.$circumCenter
    }

    /**
     * Sets the circumcenter of the face.
     * @param {yfiles.algorithms.YPoint} value The position of the circumcenter
     */
    set circumCenter(value) {
      this.$circumCenter = value
    }

    /**
     * Gets the central Voronoi node of the face.
     * @return {yfiles.algorithms.Node}
     */
    get voronoiNode() {
      return this.$voronoiNode
    }

    /**
     * Sets the central Voronoi node of the face.
     * @param {yfiles.algorithms.Node} value The the central Voronoi node of the face
     */
    set voronoiNode(value) {
      this.$voronoiNode = value
    }

    /**
     * Gets the edges of the given face.
     * @return {Array} The edges of the given face
     */
    get edges() {
      return this.$edges
    }

    /**
     * Sets the edges of the given face.
     * @param {Array} value The edges of the given face
     */
    set edges(value) {
      this.$edges = value
    }

    /**
     * Sets whether the face is the outerface.
     * @param {Boolean} value True of the face is the outerface, false otherwise
     */
    set outer(value) {
      this.$outer = value
    }

    /**
     * Gets whether the face is the outerface.
     * @return {Boolean} True of the face is the outerface, false otherwise
     */
    get outer() {
      return this.$outer
    }

    /**
     * Adds the given edges to the list of edges of the given face.
     * @param {yfiles.algorithms.Edge} edge The edge to add
     */
    addEdge(edge) {
      this.edges.push(edge)
      const source = edge.source
      const target = edge.target

      if (this.vertices.indexOf(source) < 0) {
        this.vertices.push(source)
      }

      if (this.vertices.indexOf(target) < 0) {
        this.vertices.push(target)
      }
    }

    /**
     * Returns the circumcenter defined the triangular's faces vertices.
     * Called only for triangular faces
     * @return {yfiles.algorithms.YPoint} The circumcenter of the given triangle
     */
    getCircumCenter() {
      if (this.edges.length > 3) {
        return null
      }
      if (!this.circumCenter) {
        const p1 = this.nodeCoordinates.get(this.vertices[0])
        const p2 = this.nodeCoordinates.get(this.vertices[1])
        const p3 = this.nodeCoordinates.get(this.vertices[2])
        const midPoint1 = new yfiles.algorithms.YPoint((p1.x + p2.x) / 2, (p1.y + p2.y) / 2)
        const midPoint2 = new yfiles.algorithms.YPoint((p2.x + p3.x) / 2, (p2.y + p3.y) / 2)

        const slope1 = -(p2.x - p1.x) / (p2.y - p1.y)
        const slope2 = -(p3.x - p2.x) / (p3.y - p2.y)

        const b1 = midPoint1.y - slope1 * midPoint1.x
        const b2 = midPoint2.y - slope2 * midPoint2.x
        const x = (b1 - b2) / (slope2 - slope1)

        this.circumCenter = new yfiles.algorithms.YPoint(x, slope1 * x + b1)
      }
      return this.circumCenter
    }

    /**
     * Determines whether the circumcenter of the triangle lies in the interior of the triangular face.
     * @return {boolean} True if the circumcenter of the triangle lies in the interior of the triangular face, false
     * otherwise
     */
    isCircumCenterInternal() {
      const p1 = this.nodeCoordinates.get(this.vertices[0])
      const p2 = this.nodeCoordinates.get(this.vertices[1])
      const p3 = this.nodeCoordinates.get(this.vertices[2])
      const b1 = this.sign(this.circumCenter, p1, p2) < 0
      const b2 = this.sign(this.circumCenter, p2, p3) < 0
      const b3 = this.sign(this.circumCenter, p3, p1) < 0

      return b1 === b2 && b2 === b3
    }

    /**
     * @param {yfiles.algorithms.YPoint} p1
     * @param {yfiles.algorithms.YPoint} p2
     * @param {yfiles.algorithms.YPoint} p3
     * @return {number}
     */
    sign(p1, p2, p3) {
      return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y)
    }
  }

  return VoronoiDiagram
})
