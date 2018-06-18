import { Injectable } from '@angular/core'
import { NodeData } from './node-data'
import { NODE_DATA } from './data'
import { EDGE_DATA } from './data'
import { EdgeData } from './edge-data'

@Injectable()
export class GraphDataService {
  getNodeData(): Promise<NodeData[]> {
    return Promise.resolve(NODE_DATA)
  }

  getEdgeData(): Promise<EdgeData[]> {
    return Promise.resolve(EDGE_DATA)
  }
}
