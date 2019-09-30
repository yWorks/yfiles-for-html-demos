/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.2.
 ** Copyright (c) 2000-2019 by yWorks GmbH, Vor dem Kreuzberg 28,
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
/**
 * @yjs:keep=types,Node
 */
export const Neo4jNode = neo4j.v1.types.Node
/**
 * @yjs:keep=types,Relationship
 */
export const Neo4jEdge = neo4j.v1.types.Relationship

/**
 * Establishes a connection to a Neo4j database.
 * @param {string} url The URL to connect to, usually through the bolt protocol (bolt://)
 * @param {string} user The username to use.
 * @param {string} pass The password to use.
 * @param {boolean} encrypted Whether to use encryption.
 */
export async function connectToDB(url, user, pass, encrypted) {
  // create a new Neo4j driver instance
  const neo4jDriver = neo4j.v1.driver(url, neo4j.v1.auth.basic(user, pass), {
    encrypted: encrypted,
    trust: 'TRUST_CUSTOM_CA_SIGNED_CERTIFICATES'
  })

  const runCypherQuery = createCypherQueryRunner(neo4jDriver)

  try {
    // check connection
    await runCypherQuery('MATCH (n) RETURN n LIMIT 1')
  } catch (e) {
    throw new Error(`Could not connect to Neo4j: ${e}`)
  }

  return runCypherQuery
}

function createCypherQueryRunner(neo4jDriver) {
  /**
   * @param {string} query
   * @param {Object} [params]
   * @return {Promise}
   * @yjs:keep=run
   */
  return async function runCypherQuery(query, params = {}) {
    const session = neo4jDriver.session('READ')
    let result
    try {
      result = await session.run(query, params)
    } catch (e) {
      throw new Error(`Could not run cypher query: ${e}`)
    } finally {
      session.close()
    }
    return result
  }
}
