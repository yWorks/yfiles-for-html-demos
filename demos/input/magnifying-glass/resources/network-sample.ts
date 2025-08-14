/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML.
 ** Copyright (c) by yWorks GmbH, Vor dem Kreuzberg 28,
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
export type NodeData = {
  name: string
  ip: string
  type: 'workstation' | 'notebook' | 'smartphone' | 'switch' | 'wlan' | 'server' | 'database'
  id: number
}

export type NodeObject = { data: NodeData; layout: { x: number; y: number } }

export type EdgeObject = {
  source: number
  target: number
  sourcePort: { x: number; y: number }
  targetPort: { x: number; y: number }
}

export type NetworkSample = {
  nodeList: NodeObject[]
  edgeList: EdgeObject[]
  graphBounds: { x: number; y: number; width: number; height: number }
}

export const networkData = {
  nodeList: [
    {
      data: { name: 'Switch 660', ip: '126.135.166.10', type: 'switch', id: 0 },
      layout: { x: 1105.1, y: 1212.6 }
    },
    {
      data: { name: 'Switch 185', ip: '87.113.9.193', type: 'switch', id: 1 },
      layout: { x: 764.9, y: 795.1 }
    },
    {
      data: { name: 'Switch 381', ip: '116.244.172.206', type: 'switch', id: 2 },
      layout: { x: 1216.9, y: 1082.1 }
    },
    {
      data: { name: 'Switch 610', ip: '210.185.188.168', type: 'switch', id: 3 },
      layout: { x: 1077.6, y: 1036 }
    },
    {
      data: { name: 'Switch 570', ip: '175.134.47.248', type: 'switch', id: 4 },
      layout: { x: 1030.6, y: 826.9 }
    },
    {
      data: { name: 'Switch 191', ip: '248.211.164.103', type: 'switch', id: 5 },
      layout: { x: 701.5, y: 1007.3 }
    },
    {
      data: { name: 'Switch 752', ip: '158.213.12.149', type: 'switch', id: 6 },
      layout: { x: 913.3, y: 963.4 }
    },
    {
      data: { name: 'Switch 937', ip: '235.8.77.84', type: 'switch', id: 7 },
      layout: { x: 859.7, y: 1188.4 }
    },
    {
      data: { name: 'Switch 779', ip: '253.85.74.217', type: 'switch', id: 8 },
      layout: { x: 1214.2, y: 907.4 }
    },
    {
      data: { name: 'Switch 383', ip: '159.233.198.146', type: 'switch', id: 9 },
      layout: { x: 917.4, y: 669.5 }
    },
    {
      data: { name: 'Switch 845', ip: '249.7.47.126', type: 'switch', id: 10 },
      layout: { x: 775.4, y: 1506.9 }
    },
    {
      data: { name: 'Switch 644', ip: '214.192.5.41', type: 'switch', id: 11 },
      layout: { x: 539.4, y: 1644.4 }
    },
    {
      data: { name: 'PC 382', ip: '80.22.97.136', type: 'workstation', id: 12 },
      layout: { x: 403.8, y: 1567.1 }
    },
    {
      data: { name: 'PC 285', ip: '193.202.112.62', type: 'workstation', id: 13 },
      layout: { x: 660.1, y: 1673.5 }
    },
    {
      data: { name: 'PC 256', ip: '56.204.180.137', type: 'workstation', id: 14 },
      layout: { x: 417.2, y: 1737.1 }
    },
    {
      data: { name: 'PC 421', ip: '171.106.43.136', type: 'workstation', id: 15 },
      layout: { x: 493.6, y: 1785.6 }
    },
    {
      data: { name: 'Switch 265', ip: '26.181.123.54', type: 'switch', id: 16 },
      layout: { x: 763, y: 1801.5 }
    },
    {
      data: { name: 'PC 534', ip: '224.112.167.32', type: 'workstation', id: 17 },
      layout: { x: 643.3, y: 1831.5 }
    },
    {
      data: { name: 'PC 504', ip: '172.164.44.74', type: 'workstation', id: 18 },
      layout: { x: 731.8, y: 1899.6 }
    },
    {
      data: { name: 'PC 768', ip: '207.228.232.9', type: 'workstation', id: 19 },
      layout: { x: 903.8, y: 1853.8 }
    },
    {
      data: { name: 'PC 526', ip: '154.139.131.212', type: 'workstation', id: 20 },
      layout: { x: 644.1, y: 1925.5 }
    },
    {
      data: { name: 'PC 772', ip: '48.16.215.69', type: 'workstation', id: 21 },
      layout: { x: 839.8, y: 1938.5 }
    },
    {
      data: { name: 'PC 723', ip: '142.70.165.85', type: 'workstation', id: 22 },
      layout: { x: 755, y: 1991.6 }
    },
    {
      data: { name: 'W-LAN 693', ip: '177.54.64.205', type: 'wlan', id: 23 },
      layout: { x: 573.5, y: 1396.1 }
    },
    {
      data: { name: 'Tablet 873', ip: '111.50.124.210', type: 'smartphone', id: 24 },
      layout: { x: 596.2, y: 1231.6 }
    },
    {
      data: { name: 'Tablet 404', ip: '194.51.30.41', type: 'smartphone', id: 25 },
      layout: { x: 439.1, y: 1439.6 }
    },
    {
      data: { name: 'Tablet 875', ip: '115.137.130.127', type: 'smartphone', id: 26 },
      layout: { x: 686.1, y: 1332.7 }
    },
    {
      data: { name: 'Tablet 709', ip: '3.147.20.158', type: 'smartphone', id: 27 },
      layout: { x: 590.2, y: 1518 }
    },
    {
      data: { name: 'Tablet 482', ip: '119.206.72.4', type: 'smartphone', id: 28 },
      layout: { x: 671.6, y: 1263.1 }
    },
    {
      data: { name: 'Tablet 952', ip: '19.16.237.160', type: 'smartphone', id: 29 },
      layout: { x: 731.4, y: 1400.6 }
    },
    {
      data: { name: 'Tablet 674', ip: '231.201.178.177', type: 'smartphone', id: 30 },
      layout: { x: 512.1, y: 1268.7 }
    },
    {
      data: { name: 'Tablet 766', ip: '212.52.196.143', type: 'smartphone', id: 31 },
      layout: { x: 451.1, y: 1354.6 }
    },
    {
      data: { name: 'Tablet 172', ip: '217.31.158.17', type: 'smartphone', id: 32 },
      layout: { x: 491.8, y: 1494.8 }
    },
    {
      data: { name: 'Switch 155', ip: '21.53.191.110', type: 'switch', id: 33 },
      layout: { x: 935.5, y: 1657.1 }
    },
    {
      data: { name: 'PC 621', ip: '178.156.225.134', type: 'workstation', id: 34 },
      layout: { x: 999.9, y: 1837.3 }
    },
    {
      data: { name: 'PC 661', ip: '250.59.28.21', type: 'workstation', id: 35 },
      layout: { x: 915.4, y: 1763.9 }
    },
    {
      data: { name: 'PC 740', ip: '203.168.108.91', type: 'workstation', id: 36 },
      layout: { x: 1046.4, y: 1743.7 }
    },
    {
      data: { name: 'PC 603', ip: '117.49.114.91', type: 'workstation', id: 37 },
      layout: { x: 1046.6, y: 1649 }
    },
    {
      data: { name: 'PC 576', ip: '113.98.248.206', type: 'workstation', id: 38 },
      layout: { x: 991.9, y: 1564.1 }
    },
    {
      data: { name: 'PC 615', ip: '120.14.119.109', type: 'workstation', id: 39 },
      layout: { x: 833.3, y: 1679.8 }
    },
    {
      data: { name: 'W-LAN 585', ip: '187.159.98.76', type: 'wlan', id: 40 },
      layout: { x: 912.6, y: 1381.5 }
    },
    {
      data: { name: 'Notebook 627', ip: '108.73.184.227', type: 'notebook', id: 41 },
      layout: { x: 998.5, y: 1462.7 }
    },
    {
      data: { name: 'Notebook 42', ip: '79.147.122.64', type: 'notebook', id: 42 },
      layout: { x: 1001.9, y: 1287 }
    },
    {
      data: { name: 'Notebook 718', ip: '15.143.19.79', type: 'notebook', id: 43 },
      layout: { x: 909.9, y: 1275.1 }
    },
    {
      data: { name: 'Notebook 766', ip: '95.68.251.214', type: 'notebook', id: 44 },
      layout: { x: 851.3, y: 1335.2 }
    },
    {
      data: { name: 'Notebook 284', ip: '112.57.179.69', type: 'notebook', id: 45 },
      layout: { x: 1031, y: 1372.4 }
    },
    {
      data: { name: 'Notebook 438', ip: '169.76.45.134', type: 'notebook', id: 46 },
      layout: { x: 907.5, y: 1492.6 }
    },
    {
      data: { name: 'Switch 58', ip: '94.147.254.220', type: 'switch', id: 47 },
      layout: { x: 1009.8, y: 344.8 }
    },
    {
      data: { name: 'PC 786', ip: '0.175.250.84', type: 'workstation', id: 48 },
      layout: { x: 1080.4, y: 157.2 }
    },
    {
      data: { name: 'PC 228', ip: '171.132.255.134', type: 'workstation', id: 49 },
      layout: { x: 808.2, y: 320.7 }
    },
    {
      data: { name: 'PC 547', ip: '245.150.167.232', type: 'workstation', id: 50 },
      layout: { x: 832.2, y: 236.6 }
    },
    {
      data: { name: 'PC 968', ip: '187.209.64.55', type: 'workstation', id: 51 },
      layout: { x: 822.5, y: 499 }
    },
    {
      data: { name: 'PC 123', ip: '12.118.59.238', type: 'workstation', id: 52 },
      layout: { x: 1213.9, y: 383 }
    },
    {
      data: { name: 'PC 699', ip: '90.11.188.234', type: 'workstation', id: 53 },
      layout: { x: 1202.7, y: 471.3 }
    },
    {
      data: { name: 'PC 812', ip: '183.154.39.225', type: 'workstation', id: 54 },
      layout: { x: 874.4, y: 151.8 }
    },
    {
      data: { name: 'PC 56', ip: '191.152.110.86', type: 'workstation', id: 55 },
      layout: { x: 1214.7, y: 298.5 }
    },
    {
      data: { name: 'PC 659', ip: '45.99.145.12', type: 'workstation', id: 56 },
      layout: { x: 1256.8, y: 213.8 }
    },
    {
      data: { name: 'PC 47', ip: '219.112.135.26', type: 'workstation', id: 57 },
      layout: { x: 1116, y: 502.1 }
    },
    {
      data: { name: 'Tablet 196', ip: '26.146.216.39', type: 'smartphone', id: 58 },
      layout: { x: 811.2, y: 408.5 }
    },
    {
      data: { name: 'Tablet 988', ip: '7.42.121.94', type: 'smartphone', id: 59 },
      layout: { x: 1165.9, y: 159.4 }
    },
    {
      data: { name: 'Notebook 501', ip: '236.224.43.15', type: 'notebook', id: 60 },
      layout: { x: 958.7, y: 164.1 }
    },
    {
      data: { name: 'Notebook 921', ip: '34.193.177.128', type: 'notebook', id: 61 },
      layout: { x: 1012.1, y: 72.5 }
    },
    {
      data: { name: 'Notebook 213', ip: '107.241.155.121', type: 'notebook', id: 62 },
      layout: { x: 1030.4, y: 544.4 }
    },
    {
      data: { name: 'Notebook 407', ip: '120.50.208.45', type: 'notebook', id: 63 },
      layout: { x: 908.1, y: 525 }
    },
    {
      data: { name: 'Switch 516', ip: '232.86.86.51', type: 'switch', id: 64 },
      layout: { x: 421.8, y: 1027.9 }
    },
    {
      data: { name: 'W-LAN 27', ip: '221.246.248.52', type: 'wlan', id: 65 },
      layout: { x: 192.8, y: 1129.4 }
    },
    {
      data: { name: 'Notebook 392', ip: '201.181.59.36', type: 'notebook', id: 66 },
      layout: { x: 69.5, y: 1190.7 }
    },
    {
      data: { name: 'Notebook 84', ip: '11.215.72.154', type: 'notebook', id: 67 },
      layout: { x: 41, y: 1104.5 }
    },
    {
      data: { name: 'Tablet 619', ip: '45.129.50.91', type: 'smartphone', id: 68 },
      layout: { x: 127, y: 1041.3 }
    },
    {
      data: { name: 'Tablet 418', ip: '53.71.139.100', type: 'smartphone', id: 69 },
      layout: { x: 153.7, y: 1259.1 }
    },
    {
      data: { name: 'W-LAN 437', ip: '25.204.61.210', type: 'wlan', id: 70 },
      layout: { x: 428.2, y: 887.5 }
    },
    {
      data: { name: 'PC 865', ip: '74.160.155.78', type: 'workstation', id: 71 },
      layout: { x: 512.4, y: 810.7 }
    },
    {
      data: { name: 'PC 471', ip: '114.48.54.131', type: 'workstation', id: 72 },
      layout: { x: 398.5, y: 800.4 }
    },
    {
      data: { name: 'DB 138', ip: '213.100.160.168', type: 'database', id: 73 },
      layout: { x: 516.6, y: 925.7 }
    },
    {
      data: { name: 'Server 630', ip: '49.140.250.199', type: 'server', id: 74 },
      layout: { x: 585.8, y: 958.3 }
    },
    {
      data: { name: 'PC 126', ip: '188.237.209.168', type: 'workstation', id: 75 },
      layout: { x: 266, y: 1307 }
    },
    {
      data: { name: 'PC 910', ip: '112.183.11.240', type: 'workstation', id: 76 },
      layout: { x: 242.1, y: 1234.6 }
    },
    {
      data: { name: 'Notebook 329', ip: '249.167.226.74', type: 'notebook', id: 77 },
      layout: { x: 353, y: 1331.2 }
    },
    {
      data: { name: 'Tablet 652', ip: '164.239.204.99', type: 'smartphone', id: 78 },
      layout: { x: 424.8, y: 1231.3 }
    },
    {
      data: { name: 'W-LAN 79', ip: '152.205.162.149', type: 'wlan', id: 79 },
      layout: { x: 337.4, y: 1213.6 }
    },
    {
      data: { name: 'W-LAN 971', ip: '43.90.193.125', type: 'wlan', id: 80 },
      layout: { x: 505.6, y: 1083 }
    },
    {
      data: { name: 'PC 499', ip: '100.134.26.18', type: 'workstation', id: 81 },
      layout: { x: 483, y: 1172.4 }
    },
    {
      data: { name: 'PC 557', ip: '51.225.223.169', type: 'workstation', id: 82 },
      layout: { x: 576.6, y: 1149 }
    },
    {
      data: { name: 'PC 345', ip: '70.221.196.69', type: 'workstation', id: 83 },
      layout: { x: 630.5, y: 1080 }
    },
    {
      data: { name: 'Server 243', ip: '106.199.128.182', type: 'server', id: 84 },
      layout: { x: 227, y: 739.8 }
    },
    {
      data: { name: 'W-LAN 813', ip: '91.182.176.83', type: 'wlan', id: 85 },
      layout: { x: 173.3, y: 861.2 }
    },
    {
      data: { name: 'PC 901', ip: '4.213.211.48', type: 'workstation', id: 86 },
      layout: { x: 57.4, y: 733.6 }
    },
    {
      data: { name: 'PC 805', ip: '40.211.230.60', type: 'workstation', id: 87 },
      layout: { x: 0, y: 903 }
    },
    {
      data: { name: 'PC 659', ip: '219.113.69.178', type: 'workstation', id: 88 },
      layout: { x: 216.9, y: 980.3 }
    },
    {
      data: { name: 'PC 127', ip: '147.190.38.110', type: 'workstation', id: 89 },
      layout: { x: 291.9, y: 825.2 }
    },
    {
      data: { name: 'Notebook 970', ip: '250.237.63.244', type: 'notebook', id: 90 },
      layout: { x: 85.8, y: 956.9 }
    },
    {
      data: { name: 'Notebook 636', ip: '189.40.223.176', type: 'notebook', id: 91 },
      layout: { x: 19.3, y: 818.1 }
    },
    {
      data: { name: 'Tablet 200', ip: '27.120.237.151', type: 'smartphone', id: 92 },
      layout: { x: 142.1, y: 704.9 }
    },
    {
      data: { name: 'Switch 594', ip: '129.193.230.191', type: 'switch', id: 93 },
      layout: { x: 1314.9, y: 1423.4 }
    },
    {
      data: { name: 'W-LAN 643', ip: '252.188.34.94', type: 'wlan', id: 94 },
      layout: { x: 1532.4, y: 1350.8 }
    },
    {
      data: { name: 'Notebook 475', ip: '232.115.18.251', type: 'notebook', id: 95 },
      layout: { x: 1534.2, y: 1241 }
    },
    {
      data: { name: 'Notebook 930', ip: '204.96.133.53', type: 'notebook', id: 96 },
      layout: { x: 1666.2, y: 1352 }
    },
    {
      data: { name: 'Tablet 412', ip: '121.54.190.204', type: 'smartphone', id: 97 },
      layout: { x: 1630.6, y: 1261.3 }
    },
    {
      data: { name: 'Tablet 26', ip: '94.153.21.198', type: 'smartphone', id: 98 },
      layout: { x: 1606.4, y: 1436.4 }
    },
    {
      data: { name: 'W-LAN 699', ip: '48.69.37.29', type: 'wlan', id: 99 },
      layout: { x: 1410.1, y: 1456.5 }
    },
    {
      data: { name: 'PC 647', ip: '224.136.132.206', type: 'workstation', id: 100 },
      layout: { x: 1449.8, y: 1511.7 }
    },
    {
      data: { name: 'DB 86', ip: '121.69.35.57', type: 'database', id: 101 },
      layout: { x: 1290.8, y: 1296 }
    },
    {
      data: { name: 'Server 221', ip: '237.130.242.167', type: 'server', id: 102 },
      layout: { x: 1388.6, y: 1313.6 }
    },
    {
      data: { name: 'PC 494', ip: '24.215.93.106', type: 'workstation', id: 103 },
      layout: { x: 1318.7, y: 1673 }
    },
    {
      data: { name: 'PC 989', ip: '96.255.241.62', type: 'workstation', id: 104 },
      layout: { x: 1247.5, y: 1741.8 }
    },
    {
      data: { name: 'Notebook 608', ip: '237.43.105.20', type: 'notebook', id: 105 },
      layout: { x: 1136, y: 1613.9 }
    },
    {
      data: { name: 'Tablet 5', ip: '243.100.228.228', type: 'smartphone', id: 106 },
      layout: { x: 1141.3, y: 1713 }
    },
    {
      data: { name: 'W-LAN 832', ip: '118.26.25.140', type: 'wlan', id: 107 },
      layout: { x: 1228.2, y: 1650.9 }
    },
    {
      data: { name: 'W-LAN 508', ip: '21.12.175.66', type: 'wlan', id: 108 },
      layout: { x: 1200.6, y: 1427.7 }
    },
    {
      data: { name: 'PC 810', ip: '119.143.175.116', type: 'workstation', id: 109 },
      layout: { x: 1123.5, y: 1367.8 }
    },
    {
      data: { name: 'PC 997', ip: '36.26.90.180', type: 'workstation', id: 110 },
      layout: { x: 1179.2, y: 1522.8 }
    },
    {
      data: { name: 'PC 529', ip: '30.120.243.154', type: 'workstation', id: 111 },
      layout: { x: 1102.1, y: 1453.1 }
    },
    {
      data: { name: 'Server 632', ip: '141.31.226.246', type: 'server', id: 112 },
      layout: { x: 1660.7, y: 1743.6 }
    },
    {
      data: { name: 'W-LAN 552', ip: '85.142.83.11', type: 'wlan', id: 113 },
      layout: { x: 1512.4, y: 1657.6 }
    },
    {
      data: { name: 'PC 829', ip: '192.9.137.243', type: 'workstation', id: 114 },
      layout: { x: 1655.1, y: 1568.6 }
    },
    {
      data: { name: 'PC 156', ip: '200.32.42.211', type: 'workstation', id: 115 },
      layout: { x: 1403.5, y: 1782.9 }
    },
    {
      data: { name: 'PC 356', ip: '245.105.58.215', type: 'workstation', id: 116 },
      layout: { x: 1405.1, y: 1685.7 }
    },
    {
      data: { name: 'PC 835', ip: '58.93.65.43', type: 'workstation', id: 117 },
      layout: { x: 1487.7, y: 1836.5 }
    },
    {
      data: { name: 'Notebook 369', ip: '22.150.52.13', type: 'notebook', id: 118 },
      layout: { x: 1576.3, y: 1813.4 }
    },
    {
      data: { name: 'Notebook 71', ip: '73.218.184.7', type: 'notebook', id: 119 },
      layout: { x: 1560.7, y: 1540.9 }
    },
    {
      data: { name: 'Tablet 768', ip: '56.89.190.246', type: 'smartphone', id: 120 },
      layout: { x: 1679.9, y: 1656.8 }
    },
    {
      data: { name: 'Server 665', ip: '68.157.251.208', type: 'server', id: 121 },
      layout: { x: 1207.8, y: 611.8 }
    },
    {
      data: { name: 'Server 834', ip: '22.198.239.176', type: 'server', id: 122 },
      layout: { x: 1173.6, y: 796.9 }
    },
    {
      data: { name: 'Server 940', ip: '42.16.36.54', type: 'server', id: 123 },
      layout: { x: 1227.9, y: 709.4 }
    },
    {
      data: { name: 'Server 257', ip: '14.130.27.119', type: 'server', id: 124 },
      layout: { x: 1036.2, y: 667.7 }
    },
    {
      data: { name: 'DB 375', ip: '17.43.127.73', type: 'database', id: 125 },
      layout: { x: 1120.3, y: 607.5 }
    },
    {
      data: { name: 'Switch 752', ip: '128.130.96.102', type: 'switch', id: 126 },
      layout: { x: 1127.1, y: 707.3 }
    },
    {
      data: { name: 'Switch 787', ip: '109.187.207.208', type: 'switch', id: 127 },
      layout: { x: 1499.3, y: 733 }
    },
    {
      data: { name: 'PC 78', ip: '123.191.212.167', type: 'workstation', id: 128 },
      layout: { x: 1654.2, y: 923.9 }
    },
    {
      data: { name: 'PC 963', ip: '219.93.217.173', type: 'workstation', id: 129 },
      layout: { x: 1376.1, y: 506.6 }
    },
    {
      data: { name: 'PC 926', ip: '79.102.227.137', type: 'workstation', id: 130 },
      layout: { x: 1324.1, y: 686.4 }
    },
    {
      data: { name: 'PC 218', ip: '51.110.32.193', type: 'workstation', id: 131 },
      layout: { x: 1781, y: 768.1 }
    },
    {
      data: { name: 'PC 499', ip: '165.248.205.31', type: 'workstation', id: 132 },
      layout: { x: 1460.4, y: 567.7 }
    },
    {
      data: { name: 'PC 940', ip: '78.125.54.184', type: 'workstation', id: 133 },
      layout: { x: 1312.3, y: 782.2 }
    },
    {
      data: { name: 'PC 958', ip: '63.125.63.180', type: 'workstation', id: 134 },
      layout: { x: 1691.6, y: 839 }
    },
    {
      data: { name: 'PC 475', ip: '247.185.167.102', type: 'workstation', id: 135 },
      layout: { x: 1711.1, y: 603.8 }
    },
    {
      data: { name: 'PC 379', ip: '158.221.234.137', type: 'workstation', id: 136 },
      layout: { x: 1479.4, y: 921.3 }
    },
    {
      data: { name: 'PC 982', ip: '213.89.119.227', type: 'workstation', id: 137 },
      layout: { x: 1520.1, y: 478.7 }
    },
    {
      data: { name: 'Tablet 260', ip: '216.3.208.238', type: 'smartphone', id: 138 },
      layout: { x: 1608.8, y: 497.8 }
    },
    {
      data: { name: 'Tablet 357', ip: '202.0.153.30', type: 'smartphone', id: 139 },
      layout: { x: 1626.2, y: 584.4 }
    },
    {
      data: { name: 'Notebook 203', ip: '238.255.61.77', type: 'notebook', id: 140 },
      layout: { x: 1564.3, y: 923.2 }
    },
    {
      data: { name: 'Notebook 473', ip: '59.129.114.160', type: 'notebook', id: 141 },
      layout: { x: 1326, y: 596.7 }
    },
    {
      data: { name: 'Notebook 306', ip: '127.79.243.205', type: 'notebook', id: 142 },
      layout: { x: 1394, y: 887.4 }
    },
    {
      data: { name: 'Notebook 51', ip: '73.150.158.104', type: 'notebook', id: 143 },
      layout: { x: 1695.8, y: 688.3 }
    },
    {
      data: { name: 'Server 64', ip: '146.207.120.44', type: 'server', id: 144 },
      layout: { x: 1473, y: 1039.9 }
    },
    {
      data: { name: 'Server 278', ip: '80.21.135.104', type: 'server', id: 145 },
      layout: { x: 1506.8, y: 1128.3 }
    },
    {
      data: { name: 'Server 310', ip: '51.6.235.106', type: 'server', id: 146 },
      layout: { x: 1303.9, y: 1186.2 }
    },
    {
      data: { name: 'Server 838', ip: '82.154.150.206', type: 'server', id: 147 },
      layout: { x: 1346.2, y: 1000.8 }
    },
    {
      data: { name: 'DB 992', ip: '97.115.56.223', type: 'database', id: 148 },
      layout: { x: 1421.3, y: 1196.9 }
    },
    {
      data: { name: 'Switch 76', ip: '170.52.242.167', type: 'switch', id: 149 },
      layout: { x: 1377, y: 1101.4 }
    },
    {
      data: { name: 'Switch 704', ip: '90.106.14.70', type: 'switch', id: 150 },
      layout: { x: 609.8, y: 577.2 }
    },
    {
      data: { name: 'Tablet 957', ip: '56.156.86.37', type: 'smartphone', id: 151 },
      layout: { x: 661.7, y: 427 }
    },
    {
      data: { name: 'Notebook 331', ip: '132.163.23.179', type: 'notebook', id: 152 },
      layout: { x: 754.7, y: 543.4 }
    },
    {
      data: { name: 'W-LAN 986', ip: '105.248.116.4', type: 'wlan', id: 153 },
      layout: { x: 667.2, y: 511.6 }
    },
    {
      data: { name: 'PC 147', ip: '221.162.197.28', type: 'workstation', id: 154 },
      layout: { x: 324.1, y: 688.5 }
    },
    {
      data: { name: 'Tablet 249', ip: '171.208.104.237', type: 'smartphone', id: 155 },
      layout: { x: 502.2, y: 673.2 }
    },
    {
      data: { name: 'Notebook 906', ip: '196.248.227.209', type: 'notebook', id: 156 },
      layout: { x: 415.9, y: 705.8 }
    },
    {
      data: { name: 'Switch 571', ip: '156.54.225.40', type: 'switch', id: 157 },
      layout: { x: 396.6, y: 597.1 }
    },
    {
      data: { name: 'PC 741', ip: '156.28.215.203', type: 'workstation', id: 158 },
      layout: { x: 244.9, y: 519.5 }
    },
    {
      data: { name: 'PC 41', ip: '237.78.143.5', type: 'workstation', id: 159 },
      layout: { x: 477.9, y: 512.5 }
    },
    {
      data: { name: 'PC 545', ip: '22.228.184.200', type: 'workstation', id: 160 },
      layout: { x: 334.9, y: 503.8 }
    },
    {
      data: { name: 'Server 258', ip: '131.126.93.90', type: 'server', id: 161 },
      layout: { x: 239.5, y: 607.7 }
    },
    {
      data: { name: 'PC 329', ip: '255.142.171.192', type: 'workstation', id: 162 },
      layout: { x: 686.5, y: 245.9 }
    },
    {
      data: { name: 'Switch 809', ip: '147.237.187.148', type: 'switch', id: 163 },
      layout: { x: 544.5, y: 337.8 }
    },
    {
      data: { name: 'Switch 452', ip: '239.33.177.104', type: 'switch', id: 164 },
      layout: { x: 632.8, y: 149.6 }
    },
    {
      data: { name: 'PC 265', ip: '249.134.69.109', type: 'workstation', id: 165 },
      layout: { x: 632, y: 0 }
    },
    {
      data: { name: 'PC 322', ip: '99.94.79.67', type: 'workstation', id: 166 },
      layout: { x: 718.6, y: 41.8 }
    },
    {
      data: { name: 'PC 173', ip: '240.93.48.24', type: 'workstation', id: 167 },
      layout: { x: 750.6, y: 137 }
    },
    {
      data: { name: 'PC 679', ip: '180.69.30.78', type: 'workstation', id: 168 },
      layout: { x: 546.8, y: 67.6 }
    },
    {
      data: { name: 'PC 37', ip: '90.9.151.127', type: 'workstation', id: 169 },
      layout: { x: 460.8, y: 100.1 }
    },
    {
      data: { name: 'Switch 774', ip: '141.159.216.211', type: 'switch', id: 170 },
      layout: { x: 365.7, y: 162.7 }
    },
    {
      data: { name: 'PC 509', ip: '204.196.89.194', type: 'workstation', id: 171 },
      layout: { x: 227.3, y: 212.5 }
    },
    {
      data: { name: 'PC 338', ip: '185.54.130.221', type: 'workstation', id: 172 },
      layout: { x: 294.2, y: 42 }
    },
    {
      data: { name: 'PC 779', ip: '6.21.43.63', type: 'workstation', id: 173 },
      layout: { x: 223.3, y: 126.6 }
    },
    {
      data: { name: 'PC 886', ip: '241.9.247.27', type: 'workstation', id: 174 },
      layout: { x: 383.9, y: 13.5 }
    },
    {
      data: { name: 'PC 104', ip: '206.182.124.25', type: 'workstation', id: 175 },
      layout: { x: 396.7, y: 257.2 }
    },
    {
      data: { name: 'Switch 914', ip: '19.40.121.254', type: 'switch', id: 176 },
      layout: { x: 401.6, y: 334.2 }
    },
    {
      data: { name: 'PC 236', ip: '119.53.127.26', type: 'workstation', id: 177 },
      layout: { x: 357.9, y: 419 }
    },
    {
      data: { name: 'PC 477', ip: '70.137.145.196', type: 'workstation', id: 178 },
      layout: { x: 469.5, y: 422.3 }
    },
    {
      data: { name: 'PC 430', ip: '109.251.140.169', type: 'workstation', id: 179 },
      layout: { x: 298, y: 296.5 }
    },
    {
      data: { name: 'PC 415', ip: '220.152.192.190', type: 'workstation', id: 180 },
      layout: { x: 266.1, y: 381.2 }
    },
    {
      data: { name: 'Server 258', ip: '131.126.93.90', type: 'server', id: 181 },
      layout: { x: 901.6, y: 812.9 }
    },
    {
      data: { name: 'PC 855', ip: '113.99.150.117', type: 'workstation', id: 182 },
      layout: { x: 1490.3, y: 1425.8 }
    },
    {
      data: { name: 'PC 130', ip: '49.211.126.113', type: 'workstation', id: 183 },
      layout: { x: 397.6, y: 1652.2 }
    },
    {
      data: { name: 'PC 72', ip: '24.228.86.75', type: 'workstation', id: 184 },
      layout: { x: 574.3, y: 1745.3 }
    }
  ],
  edgeList: [
    { source: 4, target: 6 },
    { source: 6, target: 7 },
    { source: 7, target: 5 },
    { source: 5, target: 1 },
    { source: 3, target: 0 },
    { source: 0, target: 7 },
    { source: 3, target: 6 },
    { source: 126, target: 124 },
    { source: 123, target: 126 },
    { source: 122, target: 126 },
    { source: 121, target: 126 },
    { source: 125, target: 126 },
    { source: 112, target: 113 },
    { source: 113, target: 117 },
    { source: 113, target: 116 },
    { source: 113, target: 93 },
    { source: 114, target: 113 },
    { source: 115, target: 113 },
    { source: 118, target: 113 },
    { source: 119, target: 113 },
    { source: 120, target: 113 },
    { source: 108, target: 93 },
    { source: 109, target: 108 },
    { source: 110, target: 108 },
    { source: 111, target: 108 },
    { source: 101, target: 93 },
    { source: 102, target: 93 },
    { source: 103, target: 107 },
    { source: 105, target: 107 },
    { source: 106, target: 107 },
    { source: 107, target: 104 },
    { source: 107, target: 93 },
    { source: 99, target: 93 },
    { source: 100, target: 99 },
    { source: 182, target: 99 },
    { source: 94, target: 93 },
    { source: 95, target: 94 },
    { source: 96, target: 94 },
    { source: 97, target: 94 },
    { source: 98, target: 94 },
    { source: 84, target: 85 },
    { source: 85, target: 89 },
    { source: 85, target: 88 },
    { source: 85, target: 64 },
    { source: 86, target: 85 },
    { source: 87, target: 85 },
    { source: 90, target: 85 },
    { source: 91, target: 85 },
    { source: 92, target: 85 },
    { source: 80, target: 64 },
    { source: 81, target: 80 },
    { source: 82, target: 80 },
    { source: 83, target: 80 },
    { source: 73, target: 64 },
    { source: 75, target: 79 },
    { source: 77, target: 79 },
    { source: 78, target: 79 },
    { source: 79, target: 76 },
    { source: 79, target: 64 },
    { source: 70, target: 64 },
    { source: 71, target: 70 },
    { source: 72, target: 70 },
    { source: 65, target: 64 },
    { source: 66, target: 65 },
    { source: 67, target: 65 },
    { source: 68, target: 65 },
    { source: 69, target: 65 },
    { source: 74, target: 64 },
    { source: 129, target: 127 },
    { source: 131, target: 127 },
    { source: 128, target: 127 },
    { source: 130, target: 127 },
    { source: 135, target: 127 },
    { source: 134, target: 127 },
    { source: 133, target: 127 },
    { source: 132, target: 127 },
    { source: 139, target: 127 },
    { source: 138, target: 127 },
    { source: 140, target: 127 },
    { source: 141, target: 127 },
    { source: 142, target: 127 },
    { source: 143, target: 127 },
    { source: 137, target: 127 },
    { source: 136, target: 127 },
    { source: 150, target: 1 },
    { source: 149, target: 147 },
    { source: 146, target: 149 },
    { source: 145, target: 149 },
    { source: 144, target: 149 },
    { source: 148, target: 149 },
    { source: 49, target: 47 },
    { source: 51, target: 47 },
    { source: 48, target: 47 },
    { source: 50, target: 47 },
    { source: 55, target: 47 },
    { source: 54, target: 47 },
    { source: 53, target: 47 },
    { source: 52, target: 47 },
    { source: 59, target: 47 },
    { source: 58, target: 47 },
    { source: 60, target: 47 },
    { source: 61, target: 47 },
    { source: 62, target: 47 },
    { source: 63, target: 47 },
    { source: 57, target: 47 },
    { source: 56, target: 47 },
    { source: 45, target: 40 },
    { source: 41, target: 40 },
    { source: 42, target: 40 },
    { source: 46, target: 40 },
    { source: 43, target: 40 },
    { source: 44, target: 40 },
    { source: 37, target: 33 },
    { source: 35, target: 33 },
    { source: 38, target: 33 },
    { source: 34, target: 33 },
    { source: 36, target: 33 },
    { source: 39, target: 33 },
    { source: 20, target: 16 },
    { source: 18, target: 16 },
    { source: 21, target: 16 },
    { source: 17, target: 16 },
    { source: 22, target: 16 },
    { source: 19, target: 16 },
    { source: 24, target: 23 },
    { source: 25, target: 23 },
    { source: 26, target: 23 },
    { source: 27, target: 23 },
    { source: 28, target: 23 },
    { source: 29, target: 23 },
    { source: 30, target: 23 },
    { source: 31, target: 23 },
    { source: 32, target: 23 },
    { source: 11, target: 10 },
    { source: 40, target: 10 },
    { source: 33, target: 10 },
    { source: 23, target: 10 },
    { source: 16, target: 10 },
    { source: 12, target: 11 },
    { source: 184, target: 11 },
    { source: 13, target: 11 },
    { source: 183, target: 11 },
    { source: 14, target: 11 },
    { source: 15, target: 11 },
    { source: 157, target: 150 },
    { source: 163, target: 150 },
    { source: 153, target: 150 },
    { source: 151, target: 153 },
    { source: 152, target: 153 },
    { source: 154, target: 157 },
    { source: 155, target: 157 },
    { source: 156, target: 157 },
    { source: 158, target: 157 },
    { source: 159, target: 157 },
    { source: 160, target: 157 },
    { source: 161, target: 157 },
    { source: 162, target: 164 },
    { source: 164, target: 163 },
    { source: 165, target: 164 },
    { source: 166, target: 164 },
    { source: 167, target: 164 },
    { source: 168, target: 164 },
    { source: 169, target: 170 },
    { source: 170, target: 163 },
    { source: 171, target: 170 },
    { source: 172, target: 170 },
    { source: 173, target: 170 },
    { source: 174, target: 170 },
    { source: 175, target: 176 },
    { source: 176, target: 163 },
    { source: 177, target: 176 },
    { source: 178, target: 176 },
    { source: 179, target: 176 },
    { source: 180, target: 176 },
    { source: 64, target: 5 },
    { source: 47, target: 9 },
    { source: 93, target: 0 },
    { source: 6, target: 1 },
    { source: 126, target: 4 },
    { source: 127, target: 8 },
    { source: 149, target: 2 },
    { source: 8, target: 4 },
    { source: 8, target: 2 },
    { source: 8, target: 3 },
    { source: 2, target: 0 },
    { source: 9, target: 4 },
    { source: 9, target: 1 },
    { source: 10, target: 7 },
    { source: 9, target: 181 },
    { source: 181, target: 4 },
    { source: 181, target: 6 },
    { source: 181, target: 1 }
  ],
  graphBounds: { x: 0, y: 0, width: 1844.956153102944, height: 2055.5790934536635 }
} as NetworkSample

export const deviceIcons = {
  database: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI3MHB4IiBoZWlnaHQ9IjcwcHgiIHZpZXdCb3g9IjAgMCA3MCA3MCI+DQogIDxnIGlkPSJkaXNrXzMiPg0KICAgIDxwYXRoIGZpbGw9IiM2MWFjZTAiIGQ9Ik0zNSA0Ni4yYy0xMC44IDAtMTkuNi0xLjktMTkuNi00LjJ2MTBjMCAyLjMgOC44IDQuMiAxOS42IDQuMnMxOS42LTEuOSAxOS42LTQuMlY0MmMwIDIuMy04LjggNC4yLTE5LjYgNC4yeiIvPg0KICAgIDxwYXRoIGZpbGw9IiM5NmNkZWEiIGQ9Ik0zNSA0Ni4yYzEwLjggMCAxOS42LTEuOSAxOS42LTQuMmwtMS4yLTJjMCAyLjItOC4yIDMuOS0xOC40IDMuOS05LjUgMC0xNy40LTItMTguNC0zLjlsLTEuMiAyYzAgMi4zIDguOCA0LjIgMTkuNiA0LjJ6Ii8+DQogICAgPHBhdGggZmlsbD0iIzNjODljOSIgZD0iTTM1IDM1LjljMTAuMiAwIDE5LjYgMi44IDE5LjYgMi44LS40IDIuNy01LjQgNS40LTE5LjYgNS40LTEyLjEgMC0xOC41LTIuNS0xOS41LTQuOS0uMy0uNyA5LjMtMy4zIDE5LjUtMy4zeiIvPg0KICA8L2c+DQogIDxnIGlkPSJkaXNrXzIiPg0KICAgIDxwYXRoIGZpbGw9IiM2MWFjZTAiIGQ9Ik0zNSAzMi43Yy0xMC44IDAtMTkuNi0xLjktMTkuNi00LjJ2MTBjMCAyLjMgOC44IDQuMiAxOS42IDQuMnMxOS42LTEuOSAxOS42LTQuMnYtMTBjMCAyLjMtOC44IDQuMi0xOS42IDQuMnoiLz4NCiAgICA8cGF0aCBmaWxsPSIjOTZjZGVhIiBkPSJNMzUgMzIuN2MxMC44IDAgMTkuNi0xLjkgMTkuNi00LjJsLTEuMi0yYzAgMi4yLTguMiAzLjktMTguNCAzLjktOS41IDAtMTcuNC0yLTE4LjQtMy45bC0xLjIgMmMwIDIuMyA4LjggNC4yIDE5LjYgNC4yeiIvPg0KICAgIDxwYXRoIGZpbGw9IiMzYzg5YzkiIGQ9Ik0zNC45IDIyLjRjMTAuMiAwIDE5LjYgMi44IDE5LjYgMi44LS40IDIuNy01LjQgNS40LTE5LjYgNS40LTEyLjEgMC0xOC41LTIuNS0xOS41LTQuOS0uMy0uNiA5LjMtMy4zIDE5LjUtMy4zeiIvPg0KICA8L2c+DQogIDxnIGlkPSJkaXNrXzEiPg0KICAgIDxwYXRoIGZpbGw9IiM2MWFjZTAiIGQ9Ik0zNSAxOS41Yy0xMC44IDAtMTkuNi0xLjktMTkuNi00LjJ2MTBjMCAyLjMgOC44IDQuMiAxOS42IDQuMnMxOS42LTEuOSAxOS42LTQuMnYtMTBjMCAyLjMtOC44IDQuMi0xOS42IDQuMnoiLz4NCiAgICA8cGF0aCBmaWxsPSIjOTZjZGVhIiBkPSJNMzUgMTkuNWMxMC44IDAgMTkuNi0xLjkgMTkuNi00LjJsLTEuMi0yYzAgMi4yLTguMiAzLjktMTguNCAzLjktOS41IDAtMTcuNC0yLTE4LjQtMy45bC0xLjIgMmMwIDIuMyA4LjggNC4yIDE5LjYgNC4yeiIvPg0KICAgIDxlbGxpcHNlIGZpbGw9IiM2MWFjZTAiIGN4PSIzNSIgY3k9IjEzLjMiIHJ4PSIxOC40IiByeT0iMy45Ii8+DQogIDwvZz4NCjwvc3ZnPg0K`,
  notebook: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI3MHB4IiBoZWlnaHQ9IjcwcHgiIHZpZXdCb3g9IjAgMCA3MCA3MCI+DQogIDxwYXRoIGQ9Ik0xMS44IDkuNWMwLTEgLjgtMS44IDEuOC0xLjhoNDMuM2MxIDAgMS44LjggMS44IDEuOHYyN2MwIDEtLjggMS44LTEuOCAxLjhIMTMuNmMtMSAwLTEuOC0uOC0xLjgtMS44di0yN3oiIGZpbGw9IiNhZmFmYWYiLz4NCiAgPHBhdGggZmlsbD0iIzZlNmU2ZSIgZD0iTTEyLjcgMTAuNGMwLTEgLjgtMS44IDEuOC0xLjhoNDEuNmMxIDAgMS44LjggMS44IDEuOHYyNC45YzAgMS0uOCAxLjgtMS44IDEuOEgxNC41Yy0xIDAtMS44LS44LTEuOC0xLjhWMTAuNHoiLz4NCiAgPHBhdGggZD0iTTEzLjMgMTAuOGMwLTEgLjgtMS44IDEuOC0xLjhoNDAuNmMxIDAgMS44LjggMS44IDEuOHYyNC4xYzAgMS0uOCAxLjgtMS44IDEuOEgxNWMtMSAwLTEuOC0uOC0xLjgtMS44VjEwLjh6IiBmaWxsPSIjNWRhY2UyIi8+DQogIDxwYXRoIGQ9Ik01OS45IDM5LjhjLS43LS45LTIuMi0xLjYtMy4zLTEuNmgtNDNjLTEuMSAwLTIuNi43LTMuMiAxLjZsLTcuNSA5LjdjLTEuMiAxLjYtMS4yIDEuOC0xLjIgMi42di4xYy4xLjQuMyAxIDEuMiAxaDY0LjhjLjggMCAxLjUtLjMgMS41LTF2LS4xYzAtLjggMC0uOC0xLjMtMi42bC04LTkuN3oiIGZpbGw9IiNjNmM2YzYiLz4NCiAgPHBhdGggZmlsbD0iIzZlNmU2ZSIgZD0iTTYxLjMgNDQuOGMuMy40LjIuOC0uNC44SDkuOGMtLjYgMC0uNy0uNC0uNC0uOGwyLjgtNGMuMy0uNSAxLS44IDEuNi0uOGg0Mi43Yy42IDAgMS4zLjQgMS42LjhsMy4yIDR6TTQyIDQ5LjVjLjEuMi0uMS40LS4zLjRIMjguM2MtLjIgMC0uNC0uMi0uMy0uNGwuOC0yLjhjLjEtLjIuMy0uNC41LS40aDExLjJjLjIgMCAuNS4yLjUuNGwxIDIuOHoiLz4NCjwvc3ZnPg0K`,
  server: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI3MCIgaGVpZ2h0PSI3MCIgdmlld0JveD0iMCAwIDcwIDcwIj4NCiAgPHBhdGggZD0iTTE3LjQ1IDE1LjE5aDM1djUzLjdoLTM1eiIgZmlsbD0iIzUxNTE1MSIvPg0KICA8cGF0aCBkPSJNMjIuOTUgMTUuMTljNy45LTEuMyAxNi0xLjMgMjQgMHY1My43Yy03LjkgMS4zLTE2IDEuMy0yNCAwdi01My43eiIgZmlsbD0iI2M2YzZjNiIvPg0KICA8cGF0aCBkPSJNMjIuOTUgMjguOWgyNHY0MGMtNy45IDEuMy0xNiAxLjMtMjQgMHYtNDB6IiBmaWxsPSIjNTE1MTUxIi8+DQogIDxwYXRoIGQ9Ik0yMi45NSAxOWM4LS42IDE2LS42IDI0IDB2OC4xaC0yNFYxOXoiIG9wYWNpdHk9Ii40MyIgZmlsbD0iI2FmYWZhZiIvPg0KICA8cGF0aCBkPSJNMjIuOTUgMTljOC0uNiAxNi0uNiAyNCAwdjguMWgtMjRWMTl6IiBvcGFjaXR5PSIuNDMiIGZpbGw9IiM0ZDRkNGQiLz4NCiAgPHBhdGggc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBkPSJNMjMuOTUgMjBsMy40LS4ydjEuMWwtMy40LjF6IiBvcGFjaXR5PSIuNDMiIGZpbGw9IiM1NjU2NTYiIHN0cm9rZT0iIzRkNGQ0ZCIgc3Ryb2tlLXdpZHRoPSIuMDEiLz4NCiAgPHBhdGggZD0iTTQ4Ljc1IDE2LjhoMy43djEuNWgtMy43em0wIDMuMmgzLjd2MS41aC0zLjd6IiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGZpbGw9IiNjOGZmMDAiIHN0cm9rZT0iIzcxNzE3MSIgc3Ryb2tlLXdpZHRoPSIuMTkiLz4NCiAgPHBhdGggZD0iTTIyLjk1IDI5LjF2MzkuN2M3LjkgMS4zIDE2IDEuMyAyMy45IDBWMjkuMWgtMjMuOXptMjIuOSAzLjhoLTIuMlYzMGgyLjJ2Mi45em0tMTIgMjMuOHYtMi45aDIuMnYyLjloLTIuMnptMi4yIDEuMXYyLjloLTIuMnYtMi45aDIuMnptMC0xNS44djIuOWgtMi4yVjQyaDIuMnptLTIuMi0xLjFWMzhoMi4ydjIuOWgtMi4yem0wIDcuOXYtMi45aDIuMnYyLjloLTIuMnptMi4yIDEuMXYyLjloLTIuMnYtMi45aDIuMnptLTMuMy01aC0yLjJWNDJoMi4ydjIuOXptMCAxdjIuOWgtMi4ydi0yLjloMi4yem0wIDR2Mi45Yy0uNyAwLTEuNSAwLTIuMi0uMXYtMi45Yy43LjEgMS41LjEgMi4yLjF6bTAgMy45djIuOWMtLjcgMC0xLjUgMC0yLjItLjF2LTIuOWMuNy4xIDEuNS4xIDIuMi4xem00LjMgMGMuNyAwIDEuNSAwIDIuMi0uMXYyLjljLS43IDAtMS41LjEtMi4yLjF2LTIuOXptMC0xdi0yLjloMi4ydjIuOWMtLjctLjEtMS40IDAtMi4yIDB6bTAtNHYtMi45aDIuMnYyLjloLTIuMnptMC0zLjlWNDJoMi4ydjIuOWMtLjctLjEtMS40LS4xLTIuMiAwem0wLTRWMzhoMi4ydjIuOWgtMi4yem0wLTMuOXYtMi45aDIuMlYzN2gtMi4yem0tMSAwaC0yLjJ2LTIuOWgyLjJWMzd6bS0zLjMgMGgtMi4ydi0yLjloMi4yVjM3em0wIDF2Mi45aC0yLjJWMzhoMi4yem0tMy4zIDIuOWMtLjcgMC0xLjUgMC0yLjItLjFWMzhoMi4ydjIuOXptMCAxdjIuOWMtLjcgMC0xLjUgMC0yLjItLjF2LTIuOWMuOC4xIDEuNS4xIDIuMi4xem0wIDR2Mi45Yy0uNyAwLTEuNS0uMS0yLjItLjF2LTIuOWMuOCAwIDEuNSAwIDIuMi4xem0wIDMuOXYyLjljLS43IDAtMS41LS4xLTIuMi0uMXYtMi45Yy43IDAgMS41LjEgMi4yLjF6bTAgMy45djIuOWMtLjcgMC0xLjUtLjEtMi4yLS4xdi0yLjljLjcuMSAxLjUuMSAyLjIuMXptMCA0djIuOWMtLjcgMC0xLjUtLjEtMi4yLS4xdi0yLjhjLjctLjEgMS41LS4xIDIuMiAwem0xLjEgMGMuNyAwIDEuNS4xIDIuMi4xdjIuOWMtLjcgMC0xLjUgMC0yLjItLjF2LTIuOXptMi4yIDR2Mi45Yy0uNyAwLTEuNSAwLTIuMi0uMXYtMi45Yy43LjEgMS41LjEgMi4yLjF6bTEuMSAwaDIuMnYyLjloLTIuMnYtMi45em0zLjIgMGMuNyAwIDEuNSAwIDIuMi0uMXYyLjljLS43IDAtMS41LjEtMi4yLjF2LTIuOXptMC0xdi0yLjljLjcgMCAxLjUgMCAyLjItLjF2Mi45Yy0uNyAwLTEuNCAwLTIuMi4xem0zLjMtM2MuNyAwIDEuNS0uMSAyLjItLjF2Mi44Yy0uNy4xLTEuNS4xLTIuMi4ydi0yLjl6bTAtMS4xdi0yLjljLjcgMCAxLjUtLjEgMi4yLS4xdjIuOWMtLjcgMC0xLjQuMS0yLjIuMXptMC0zLjl2LTIuOWMuNyAwIDEuNS0uMSAyLjItLjF2Mi45Yy0uNyAwLTEuNCAwLTIuMi4xem0wLTR2LTIuOWMuNyAwIDEuNS0uMSAyLjItLjF2Mi45Yy0uNy4xLTEuNS4xLTIuMi4xem0wLTMuOXYtMi45Yy43IDAgMS41IDAgMi4yLS4xdjIuOWMtLjcuMS0xLjUuMS0yLjIuMXptMC0zLjlWMzhoMi4ydjIuOGMtLjcgMC0xLjUgMC0yLjIuMXptMC00VjM0aDIuMnYyLjloLTIuMnptMC0zLjl2LTIuOWgyLjJWMzNoLTIuMnptLTEgMGgtMi4ydi0yLjloMi4yVjMzem0tMy4zIDBoLTIuMnYtMi45aDIuMlYzM3ptLTMuMyAwaC0yLjJ2LTIuOWgyLjJWMzN6bS0zLjMgMGgtMi4ydi0yLjloMi4yVjMzem0wIDEuMVYzN2gtMi4ydi0yLjloMi4yem0tMy4yIDIuOGMtLjcgMC0xLjUgMC0yLjItLjFWMzRoMi4ydjIuOXptMCAxdjIuOGMtLjcgMC0xLjUtLjEtMi4yLS4xdi0yLjhjLjcuMSAxLjQuMSAyLjIuMXptMCAzLjl2Mi44Yy0uNyAwLTEuNS0uMS0yLjItLjF2LTIuOGMuNy4xIDEuNC4xIDIuMi4xem0wIDMuOXYyLjljLS43IDAtMS41LS4xLTIuMi0uMXYtMi44aDIuMnptMCAzLjl2Mi45Yy0uNy0uMS0xLjUtLjEtMi4yLS4ydi0yLjhjLjcuMSAxLjQuMSAyLjIuMXptMCA0djIuOWMtLjctLjEtMS41LS4xLTIuMi0uMnYtMi44Yy43LS4xIDEuNCAwIDIuMi4xem0wIDMuOXYyLjhjLS43LS4xLTEuNS0uMS0yLjItLjJ2LTIuOGMuNyAwIDEuNC4xIDIuMi4yem0wIDMuOHYyLjlsLTIuMi0uM3YtMi44Yy43LjEgMS40LjIgMi4yLjJ6bTEgLjFjLjcuMSAxLjUuMSAyLjIuMnYyLjljLS43IDAtMS41LS4xLTIuMi0uMnYtMi45em0yLjIgNC4xdjIuOWMtLjctLjEtMS41LS4xLTIuMi0uMnYtMi45Yy43LjEgMS41LjIgMi4yLjJ6bTEuMS4xYy43IDAgMS41LjEgMi4yLjF2Mi45Yy0uNyAwLTEuNS0uMS0yLjItLjF2LTIuOXptMy4zLjFoMi4ydjIuOWgtMi4ydi0yLjl6bTMuMiAwYy43IDAgMS41IDAgMi4yLS4xdjIuOWMtLjcgMC0xLjUuMS0yLjIuMXYtMi45em0zLjMtLjJjLjcgMCAxLjUtLjEgMi4yLS4ydjIuOWMtLjcuMS0xLjUuMS0yLjIuMnYtMi45em0wLTF2LTIuOWMuNyAwIDEuNS0uMSAyLjItLjJ2Mi45Yy0uNy4xLTEuNC4xLTIuMi4yem0zLjMtMy4yYy43LS4xIDEuNS0uMSAyLjItLjJ2Mi44bC0yLjIuM3YtMi45em0wLTF2LTIuOGMuNy0uMSAxLjUtLjEgMi4yLS4ydjIuOGMtLjcuMS0xLjUuMS0yLjIuMnptMC0zLjl2LTIuOGMuNy0uMSAxLjUtLjEgMi4yLS4ydjIuOGMtLjcuMS0xLjUuMS0yLjIuMnptMC0zLjl2LTIuOWMuNyAwIDEuNS0uMSAyLjItLjF2Mi44Yy0uNy4xLTEuNS4xLTIuMi4yem0wLTMuOXYtMi45Yy43IDAgMS41LS4xIDIuMi0uMXYyLjhjLS43LjEtMS41LjEtMi4yLjJ6bTAtMy45di0yLjhjLjcgMCAxLjUtLjEgMi4yLS4xdjIuOGMtLjcgMC0xLjUgMC0yLjIuMXptMC0zLjlWMzhjLjcgMCAxLjUgMCAyLjItLjF2Mi44Yy0uNyAwLTEuNSAwLTIuMi4xem0wLTMuOVYzNGgyLjJ2Mi44Yy0uNyAwLTEuNS4xLTIuMi4xem0tMTcuNC02LjhWMzNoLTIuMnYtMi44Yy43LS4xIDEuNC0uMSAyLjItLjF6TTIzLjk1IDY1bDIuMi4zdjIuOWwtMi4yLS4zVjY1em0xOS43IDMuMXYtMi45bDIuMi0uM3YyLjhjLS43LjItMS41LjMtMi4yLjR6IiBmaWxsPSIjYzZjNmM2Ii8+DQo8L3N2Zz4NCg==`,
  smartphone: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI3MCIgaGVpZ2h0PSI3MCIgdmlld0JveD0iMCAwIDcwIDcwIj4NCiAgPHBhdGggZD0iTTE3LjQ1IDE1LjE5aDM1djUzLjdoLTM1eiIgZmlsbD0iIzUxNTE1MSIvPg0KICA8cGF0aCBkPSJNMjIuOTUgMTUuMTljNy45LTEuMyAxNi0xLjMgMjQgMHY1My43Yy03LjkgMS4zLTE2IDEuMy0yNCAwdi01My43eiIgZmlsbD0iI2M2YzZjNiIvPg0KICA8cGF0aCBkPSJNMjIuOTUgMjguOWgyNHY0MGMtNy45IDEuMy0xNiAxLjMtMjQgMHYtNDB6IiBmaWxsPSIjNTE1MTUxIi8+DQogIDxwYXRoIGQ9Ik0yMi45NSAxOWM4LS42IDE2LS42IDI0IDB2OC4xaC0yNFYxOXoiIG9wYWNpdHk9Ii40MyIgZmlsbD0iI2FmYWZhZiIvPg0KICA8cGF0aCBkPSJNMjIuOTUgMTljOC0uNiAxNi0uNiAyNCAwdjguMWgtMjRWMTl6IiBvcGFjaXR5PSIuNDMiIGZpbGw9IiM0ZDRkNGQiLz4NCiAgPHBhdGggc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBkPSJNMjMuOTUgMjBsMy40LS4ydjEuMWwtMy40LjF6IiBvcGFjaXR5PSIuNDMiIGZpbGw9IiM1NjU2NTYiIHN0cm9rZT0iIzRkNGQ0ZCIgc3Ryb2tlLXdpZHRoPSIuMDEiLz4NCiAgPHBhdGggZD0iTTQ4Ljc1IDE2LjhoMy43djEuNWgtMy43em0wIDMuMmgzLjd2MS41aC0zLjd6IiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGZpbGw9IiNjOGZmMDAiIHN0cm9rZT0iIzcxNzE3MSIgc3Ryb2tlLXdpZHRoPSIuMTkiLz4NCiAgPHBhdGggZD0iTTIyLjk1IDI5LjF2MzkuN2M3LjkgMS4zIDE2IDEuMyAyMy45IDBWMjkuMWgtMjMuOXptMjIuOSAzLjhoLTIuMlYzMGgyLjJ2Mi45em0tMTIgMjMuOHYtMi45aDIuMnYyLjloLTIuMnptMi4yIDEuMXYyLjloLTIuMnYtMi45aDIuMnptMC0xNS44djIuOWgtMi4yVjQyaDIuMnptLTIuMi0xLjFWMzhoMi4ydjIuOWgtMi4yem0wIDcuOXYtMi45aDIuMnYyLjloLTIuMnptMi4yIDEuMXYyLjloLTIuMnYtMi45aDIuMnptLTMuMy01aC0yLjJWNDJoMi4ydjIuOXptMCAxdjIuOWgtMi4ydi0yLjloMi4yem0wIDR2Mi45Yy0uNyAwLTEuNSAwLTIuMi0uMXYtMi45Yy43LjEgMS41LjEgMi4yLjF6bTAgMy45djIuOWMtLjcgMC0xLjUgMC0yLjItLjF2LTIuOWMuNy4xIDEuNS4xIDIuMi4xem00LjMgMGMuNyAwIDEuNSAwIDIuMi0uMXYyLjljLS43IDAtMS41LjEtMi4yLjF2LTIuOXptMC0xdi0yLjloMi4ydjIuOWMtLjctLjEtMS40IDAtMi4yIDB6bTAtNHYtMi45aDIuMnYyLjloLTIuMnptMC0zLjlWNDJoMi4ydjIuOWMtLjctLjEtMS40LS4xLTIuMiAwem0wLTRWMzhoMi4ydjIuOWgtMi4yem0wLTMuOXYtMi45aDIuMlYzN2gtMi4yem0tMSAwaC0yLjJ2LTIuOWgyLjJWMzd6bS0zLjMgMGgtMi4ydi0yLjloMi4yVjM3em0wIDF2Mi45aC0yLjJWMzhoMi4yem0tMy4zIDIuOWMtLjcgMC0xLjUgMC0yLjItLjFWMzhoMi4ydjIuOXptMCAxdjIuOWMtLjcgMC0xLjUgMC0yLjItLjF2LTIuOWMuOC4xIDEuNS4xIDIuMi4xem0wIDR2Mi45Yy0uNyAwLTEuNS0uMS0yLjItLjF2LTIuOWMuOCAwIDEuNSAwIDIuMi4xem0wIDMuOXYyLjljLS43IDAtMS41LS4xLTIuMi0uMXYtMi45Yy43IDAgMS41LjEgMi4yLjF6bTAgMy45djIuOWMtLjcgMC0xLjUtLjEtMi4yLS4xdi0yLjljLjcuMSAxLjUuMSAyLjIuMXptMCA0djIuOWMtLjcgMC0xLjUtLjEtMi4yLS4xdi0yLjhjLjctLjEgMS41LS4xIDIuMiAwem0xLjEgMGMuNyAwIDEuNS4xIDIuMi4xdjIuOWMtLjcgMC0xLjUgMC0yLjItLjF2LTIuOXptMi4yIDR2Mi45Yy0uNyAwLTEuNSAwLTIuMi0uMXYtMi45Yy43LjEgMS41LjEgMi4yLjF6bTEuMSAwaDIuMnYyLjloLTIuMnYtMi45em0zLjIgMGMuNyAwIDEuNSAwIDIuMi0uMXYyLjljLS43IDAtMS41LjEtMi4yLjF2LTIuOXptMC0xdi0yLjljLjcgMCAxLjUgMCAyLjItLjF2Mi45Yy0uNyAwLTEuNCAwLTIuMi4xem0zLjMtM2MuNyAwIDEuNS0uMSAyLjItLjF2Mi44Yy0uNy4xLTEuNS4xLTIuMi4ydi0yLjl6bTAtMS4xdi0yLjljLjcgMCAxLjUtLjEgMi4yLS4xdjIuOWMtLjcgMC0xLjQuMS0yLjIuMXptMC0zLjl2LTIuOWMuNyAwIDEuNS0uMSAyLjItLjF2Mi45Yy0uNyAwLTEuNCAwLTIuMi4xem0wLTR2LTIuOWMuNyAwIDEuNS0uMSAyLjItLjF2Mi45Yy0uNy4xLTEuNS4xLTIuMi4xem0wLTMuOXYtMi45Yy43IDAgMS41IDAgMi4yLS4xdjIuOWMtLjcuMS0xLjUuMS0yLjIuMXptMC0zLjlWMzhoMi4ydjIuOGMtLjcgMC0xLjUgMC0yLjIuMXptMC00VjM0aDIuMnYyLjloLTIuMnptMC0zLjl2LTIuOWgyLjJWMzNoLTIuMnptLTEgMGgtMi4ydi0yLjloMi4yVjMzem0tMy4zIDBoLTIuMnYtMi45aDIuMlYzM3ptLTMuMyAwaC0yLjJ2LTIuOWgyLjJWMzN6bS0zLjMgMGgtMi4ydi0yLjloMi4yVjMzem0wIDEuMVYzN2gtMi4ydi0yLjloMi4yem0tMy4yIDIuOGMtLjcgMC0xLjUgMC0yLjItLjFWMzRoMi4ydjIuOXptMCAxdjIuOGMtLjcgMC0xLjUtLjEtMi4yLS4xdi0yLjhjLjcuMSAxLjQuMSAyLjIuMXptMCAzLjl2Mi44Yy0uNyAwLTEuNS0uMS0yLjItLjF2LTIuOGMuNy4xIDEuNC4xIDIuMi4xem0wIDMuOXYyLjljLS43IDAtMS41LS4xLTIuMi0uMXYtMi44aDIuMnptMCAzLjl2Mi45Yy0uNy0uMS0xLjUtLjEtMi4yLS4ydi0yLjhjLjcuMSAxLjQuMSAyLjIuMXptMCA0djIuOWMtLjctLjEtMS41LS4xLTIuMi0uMnYtMi44Yy43LS4xIDEuNCAwIDIuMi4xem0wIDMuOXYyLjhjLS43LS4xLTEuNS0uMS0yLjItLjJ2LTIuOGMuNyAwIDEuNC4xIDIuMi4yem0wIDMuOHYyLjlsLTIuMi0uM3YtMi44Yy43LjEgMS40LjIgMi4yLjJ6bTEgLjFjLjcuMSAxLjUuMSAyLjIuMnYyLjljLS43IDAtMS41LS4xLTIuMi0uMnYtMi45em0yLjIgNC4xdjIuOWMtLjctLjEtMS41LS4xLTIuMi0uMnYtMi45Yy43LjEgMS41LjIgMi4yLjJ6bTEuMS4xYy43IDAgMS41LjEgMi4yLjF2Mi45Yy0uNyAwLTEuNS0uMS0yLjItLjF2LTIuOXptMy4zLjFoMi4ydjIuOWgtMi4ydi0yLjl6bTMuMiAwYy43IDAgMS41IDAgMi4yLS4xdjIuOWMtLjcgMC0xLjUuMS0yLjIuMXYtMi45em0zLjMtLjJjLjcgMCAxLjUtLjEgMi4yLS4ydjIuOWMtLjcuMS0xLjUuMS0yLjIuMnYtMi45em0wLTF2LTIuOWMuNyAwIDEuNS0uMSAyLjItLjJ2Mi45Yy0uNy4xLTEuNC4xLTIuMi4yem0zLjMtMy4yYy43LS4xIDEuNS0uMSAyLjItLjJ2Mi44bC0yLjIuM3YtMi45em0wLTF2LTIuOGMuNy0uMSAxLjUtLjEgMi4yLS4ydjIuOGMtLjcuMS0xLjUuMS0yLjIuMnptMC0zLjl2LTIuOGMuNy0uMSAxLjUtLjEgMi4yLS4ydjIuOGMtLjcuMS0xLjUuMS0yLjIuMnptMC0zLjl2LTIuOWMuNyAwIDEuNS0uMSAyLjItLjF2Mi44Yy0uNy4xLTEuNS4xLTIuMi4yem0wLTMuOXYtMi45Yy43IDAgMS41LS4xIDIuMi0uMXYyLjhjLS43LjEtMS41LjEtMi4yLjJ6bTAtMy45di0yLjhjLjcgMCAxLjUtLjEgMi4yLS4xdjIuOGMtLjcgMC0xLjUgMC0yLjIuMXptMC0zLjlWMzhjLjcgMCAxLjUgMCAyLjItLjF2Mi44Yy0uNyAwLTEuNSAwLTIuMi4xem0wLTMuOVYzNGgyLjJ2Mi44Yy0uNyAwLTEuNS4xLTIuMi4xem0tMTcuNC02LjhWMzNoLTIuMnYtMi44Yy43LS4xIDEuNC0uMSAyLjItLjF6TTIzLjk1IDY1bDIuMi4zdjIuOWwtMi4yLS4zVjY1em0xOS43IDMuMXYtMi45bDIuMi0uM3YyLjhjLS43LjItMS41LjMtMi4yLjR6IiBmaWxsPSIjYzZjNmM2Ii8+DQo8L3N2Zz4NCg==`,
  switch: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNzAiIHdpZHRoPSI3MCIgdmlld0JveD0iMCAwIDcwIDcwIj4NCiAgPHBhdGggZD0iTTY4LjA2IDMxLjMzbC0uMS0uMS0xMS4xLTcuOWMtMS4yLS45LTMuMy0xLjctNC43LTEuOSAwIDAtNS4xLS41LTE2LjktLjUtOS42IDAtMTcuMy42LTE3LjMuNi0xLjQuMS0zLjUuOS00LjcgMS44bC0xMC44IDcuN2MtMS4xLjUtMiAyLTIgMy43djljMCAyIDEuMSAzLjcgMi41IDMuOSAwIDAgMTIuNyAxLjUgMzIgMS41IDE5LjkgMCAzMi0xLjUgMzItMS41IDEuNC0uMiAyLjUtMS45IDIuNS0zLjl2LTljMC0xLjQtLjYtMi43LTEuNC0zLjR6bS0zMi42LTEuOWgtLjMuM3ptLTEuNyAwaC0uMS4xeiIgZmlsbD0iIzZlNmU2ZSIvPg0KICA8cGF0aCBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGQ9Ik02My4yNiAzNC40M2MtLjYtLjMtMTguMi0uMy0yOC4zLS4zLTguMiAwLTI3LjguMS0yNy44LjEtMSAuNC0xLjcgMS43LTEuNyAzLjJ2NS42YzAgMS43IDEgMy4yIDIuMSAzLjMgMCAwIDEwLjguNyAyNy40LjcgMTcgMCAyNy40LS43IDI3LjQtLjcgMS4yLS4xIDIuMS0xLjYgMi4xLTMuM3YtNS42YzAtMS4zLS42LTIuNy0xLjItM3oiIGZpbGw9IiM1ZGFjZTIiIHN0cm9rZT0iI2FmYWZhZiIgc3Ryb2tlLXdpZHRoPSIuNSIvPg0KICA8ZyBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiPg0KICAgIDxwYXRoIGQ9Ik02Ni44NiAzNi41M2gyLjh2MS42aC0yLjh6IiBmaWxsPSIjYzhmZjAwIiBzdHJva2U9IiM3MTcxNzEiIHN0cm9rZS13aWR0aD0iLjA2Ii8+DQogICAgPHBhdGggZD0iTTQ5Ljc2IDM2LjQzaC02Ljh2Ny4xaDJ2MWgyLjhsLS4xLTFoMi4xem0tMTEuNSAwaC02Ljh2Ny4xaDJ2MWgyLjhsLS4xLTFoMi4xem0tMTEuNSAwaC02Ljh2Ny4xaDJ2MWgyLjd2LTFoMi4xem0tMTEuNSAwaC02Ljh2Ny4xaDJ2MWgyLjd2LTFoMi4xem00NiAwaC02Ljh2Ny4xaDJ2MWgyLjhsLS4xLTFoMi4xeiIgZmlsbD0iIzRkNGQ0ZCIgc3Ryb2tlPSIjZDlmMWZmIiBzdHJva2Utd2lkdGg9Ii4zNyIvPg0KICA8L2c+DQo8L3N2Zz4=`,
  wlan: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI3MCIgaGVpZ2h0PSI3MCIgdmlld0JveD0iMCAwIDcwIDcwIj4NCiAgPHBhdGggZmlsbD0iIzlDRDdGRiIgZD0iTTkuNTggNDUuODVhMjcuNTQgMjcuNTQgMCAxIDEgNTAuMjkgMGw0LjQxIDIuMDNhMzIuNCAzMi40IDAgMSAwLTU5LjEyIDBsNC40Mi0yLjAzeiIvPg0KICA8cGF0aCBmaWxsPSIjOWNkN2ZmIiBkPSJNMTguNDIgNDEuOGExNy44MiAxNy44MiAwIDEgMSAzMi42IDBsNC40MiAyLjAyYTIyLjY4IDIyLjY4IDAgMSAwLTQxLjQzIDBsNC40LTIuMDN6Ii8+DQogIDxwYXRoIGZpbGw9IiM5Y2Q3ZmYiIGQ9Ik0yNy4yNSAzNy43NGE4LjEgOC4xIDAgMSAxIDE0Ljk1IDBsNC40MSAyLjAzYTEyLjk2IDEyLjk2IDAgMSAwLTIzLjc4IDBsNC40Mi0yLjAzeiIvPg0KICA8cGF0aCBmaWxsPSIjYWZhZmFmIiBkPSJNMjEuNDggNTIuMjJjMCAuNjUtLjUzIDEuMTgtMS4xOCAxLjE4aC0uMTRjLS42NSAwLTEuMTgtLjUzLTEuMTgtMS4xOHYtMjkuOGMwLS42NC41My0xLjE3IDEuMTgtMS4xN2guMTRjLjY1IDAgMS4xOC41MyAxLjE4IDEuMTh2MjkuOHptMjkuNCAwYzAgLjY1LS41MyAxLjE4LTEuMTggMS4xOGgtLjE0Yy0uNjUgMC0xLjE4LS41My0xLjE4LTEuMTh2LTI5LjhjMC0uNjQuNTMtMS4xNyAxLjE4LTEuMTdoLjE0Yy42NSAwIDEuMTguNTMgMS4xOCAxLjE4djI5Ljh6Ii8+DQogIDxwYXRoIGZpbGw9IiNhZmFmYWYiIGQ9Ik02Ni4xOCA1Ni41NWguMDJsLS4wNi0uMDItLjA4LS4wNC0xMC40My01LjE3YTE0LjIgMTQuMiAwIDAgMC00LjQ1LTEuMjNzLTQuNzgtLjM2LTE1LjktLjM2Yy05LjEgMC0xNi4zNi40LTE2LjM2LjQtMS4zLjA4LTMuMy42LTQuNDYgMS4xOEw0LjMzIDU2LjM1YTIuNiAyLjYgMCAwIDAtMS44NyAyLjQ0djUuODhhMi42IDIuNiAwIDAgMCAyLjM1IDIuNTRzMTEuOTYuOTggMzAuMi45OWMxOC44IDAgMzAuMTktLjk4IDMwLjE5LS45OGEyLjYyIDIuNjIgMCAwIDAgMi4zNC0yLjU1di01Ljg4YzAtLjk0LS41Ni0xLjgtMS4zNi0yLjI0em0tMzAuNzMtMS4yOWgtLjI2LjI2em0tMS41NiAwaC0uMTMuMTN6Ii8+DQogIDxwYXRoIGZpbGw9IiM1ZGFjZTIiIGQ9Ik01MS42MiA1Ni41NWguMDFsLS4wMy0uMDItLjA0LS4wNC01LjU4LTUuNjZhNS4yMiA1LjIyIDAgMCAwLTIuMzgtMS4yM3MtMi41NS0uMzctOC40Ny0uMzdjLTQuODUgMC04LjczLjQxLTguNzMuNDEtLjY4LjA3LTEuNzUuNi0yLjM3IDEuMThsLTUuMzggNS41M2MtLjU3LjMtMSAxLjMxLTEgMi40NHY2LjY4YzAgMS4zLjU3IDIuNDQgMS4yNiAyLjU1IDAgMCA2LjM3Ljk4IDE2LjEuOTggMTAuMDIgMCAxNi4wOS0uOTcgMTYuMDktLjk3LjY5LS4xMSAxLjI1LTEuMjcgMS4yNS0yLjU2di02LjY4YzAtLjk0LS4zLTEuOC0uNzMtMi4yNHptLTE2LjM4LTEuMjloLS4xNC4xNHptLS44MyAwaC0uMDcuMDd6Ii8+DQogIDxwYXRoIGQ9Ik02NS4wNCA1OS45MWgyLjY1djEuMDhoLTIuNjV6bS0yNS44OCAyLjU3aDQuMDJsLjA2IDIuMzFoLTQuMDJ6bS02LjIzLjIyaDQuMDJMMzcgNjVoLTQuMDJ6bS02LjIzLS4yMmg0LjAybC4wNiAyLjMxaC00LjAyem0xOC42OS0uMjloNC4wMmwuMDYgMi4zaC00LjAyem0tMjQuOTIgMGg0LjAybC4wNiAyLjNoLTQuMDJ6IiBmaWxsPSIjQzhGRjAwIiBzdHJva2U9IiM3MTcxNzEiIHN0cm9rZS13aWR0aD0iLjA2IiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiLz4NCjwvc3ZnPg==`,
  workstation: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI3MCIgaGVpZ2h0PSI3MCIgdmlld0JveD0iMCAwIDcwIDcwIj4NCiAgPHBhdGggZmlsbD0iI2FmYWZhZiIgZD0iTTU0LjY1IDU5LjQ4Yy4xOS40Ni0uMDYuODQtLjU2Ljg0SDMuOWMtLjUgMC0uNi0uMjgtLjIzLS42bDguMDItNy4yYy4zNy0uMzMgMS4wOS0uNiAxLjU5LS42aDM3LjI1Yy41IDAgMS4wNy4zNyAxLjI3LjgzbDIuODYgNi43M3oiLz4NCiAgPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOEQ4RDhEIiBzdHJva2Utd2lkdGg9Ii4yNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGQ9Ik01NC42NSA1OS40OGMuMTkuNDYtLjA2Ljg0LS41Ni44NEgzLjljLS41IDAtLjYtLjI4LS4yMy0uNmw4LjAyLTcuMmMuMzctLjMzIDEuMDktLjYgMS41OS0uNmgzNy4yNWMuNSAwIDEuMDcuMzcgMS4yNy44M2wyLjg2IDYuNzN6Ii8+DQogIDxwYXRoIGZpbGw9IiM3MTcxNzEiIGQ9Ik0zNS40MyA1OC4xM2MwIC4yNS0uMi40Ni0uNDYuNDZINy4zNGMtLjI1IDAtLjMtLjE0LS4xMi0uM2w1LjYzLTUuMTZjLjE5LS4xNy41NC0uMzEuOC0uMzFoMjEuMzNjLjI1IDAgLjQ1LjIuNDUuNDV2NC44NnptOC42Mi4wM2EuNy43IDAgMCAwIC42LjQzaDcuNDdjLjI1IDAgLjM4LS4xOS4yOC0uNDJsLTIuMDUtNC45M2EuNzUuNzUgMCAwIDAtLjYzLS40MmgtNy4xN2MtLjI1IDAtLjM4LjE5LS4zLjQzbDEuOCA0Ljkxem0tNy44NS0uMDNjMCAuMjUuMi40Ni40Ni40Nmg2LjEzYy4yNSAwIC4zOC0uMi4zLS40M2wtLjE2LS40YS43LjcgMCAwIDAtLjYyLS40MmwtMS4wNC4wMmEuNjIuNjIgMCAwIDEtLjU4LS40M2wtLjAyLS4wOWEuNjIuNjIgMCAwIDAtLjU3LS40NGgtMS4zYS40NC40NCAwIDAgMC0uNDQuNDZ2LjA2YS40My40MyAwIDAgMS0uNDMuNDZsLTEuMjYuMDJhLjQ2LjQ2IDAgMCAwLS40Ni40NnYuMjd6bTAtMy41NmMwIC4yNS4yLjQ1LjQ2LjQ1aDQuODRjLjI1IDAgLjQtLjIuMzItLjQ0bC0uNC0xLjMzYS42NS42NSAwIDAgMC0uNTgtLjQ0aC00LjE4Yy0uMjUgMC0uNDYuMi0uNDYuNDZ2MS4zeiIvPg0KICA8cGF0aCBmaWxsPSIjNmU2ZTZlIiBkPSJNNTAuMzYgNDguMDhjMCAuOTYtNi43NiAxLjQtMTIuMzcgMS40LTMuOSAwLTEwLjkyLS4zNS0xMS4zNy0xLjI3djEuNjZjMCAuNzMgNC44IDEuMjQgMTEuMzYgMS4yNCA2LjU1IDAgMTIuMzgtLjY0IDEyLjM4LTEuMzZ2LTEuNjd6Ii8+DQogIDxwYXRoIGZpbGw9ImdyYXkiIGQ9Ik0zOC40OSA0Ni44N2M2LjU2IDAgMTEuODcuNTggMTEuODcgMS4zIDAgLjczLTUuMzEgMS40My0xMS44NyAxLjQzLTYuNyAwLTExLjg3LS43LTExLjg3LTEuNDJzNS4zMi0xLjMxIDExLjg3LTEuMzF6Ii8+DQogIDxwYXRoIGZpbGw9IiM2ZTZlNmUiIGQ9Ik00MS4wNSA0OC40NnMtMS40OC4xLTIuNS4xLTIuNS0uMS0yLjUtLjF2LTkuNzdoNXY5Ljc3eiIvPg0KICA8cGF0aCBmaWxsPSIjNmU2ZTZlIiBkPSJNMTIuNzYgOS42OGMwLTEuMS45LTIgMi0yaDQ4LjI1YTIgMiAwIDAgMSAyIDJ2MzAuMDhhMiAyIDAgMCAxLTIgMkgxNC43NmEyIDIgMCAwIDEtMi0yVjkuNjh6Ii8+DQogIDxwYXRoIGZpbGw9IiNhZmFmYWYiIGQ9Ik0xMy43OSAxMC43YzAtMS4xLjktMiAyLTJoNDYuNDNhMiAyIDAgMCAxIDIgMnYyNy44MWEyIDIgMCAwIDEtMiAySDE1Ljc5YTIgMiAwIDAgMS0yLTJ2LTI3Ljh6Ii8+DQogIDxwYXRoIGZpbGw9IiM2MWFjZTAiIGQ9Ik0xNC4zNSAxMS4xNmMwLTEuMS45LTIgMi0yaDQ1LjNhMiAyIDAgMCAxIDIgMnYyNi45YTIgMiAwIDAgMS0yIDJoLTQ1LjNhMiAyIDAgMCAxLTItMnYtMjYuOXoiLz4NCiAgPHBhdGggZmlsbD0iI0M5QzlDOSIgZD0iTTYyLjA5IDU0LjE2YTIuNjYgMi42NiAwIDAgMS0uNzEtLjQ4Yy4yNy4xNS41LjMyLjcuNDh6Ii8+DQogIDxwYXRoIGZpbGw9IiNhZmFmYWYiIGQ9Ik02Mi4wOCA1NC4xNmguMDFjLjA5LjAzLjE2LjAzLjIyLS4wMi4wMiAwIC4wMy0uMDIuMDQtLjA0LjYtLjEyIDEuMzMtLjE1IDIuMi0uMDggMi4wMyAxLjU0IDMuNzYgNC42MiAxLjE3IDUuOC0yLjA0LjkzLTMuNTQuNzgtNC43Mi0uNDlhMTUuMTMgMTUuMTMgMCAwIDEtMS43My0yLjI2Yy4yNy0xLjE0LjktMi40NSAyLjgxLTIuOTF6Ii8+DQogIDxwYXRoIGZpbGw9IiNhZmFmYWYiIGQ9Ik01OS4yNyA1Ny4wN2MtLjktMS40NC0xLjM1LTIuODctLjY2LTMuNTQuMjQtLjIzLjU0LS40Mi44Ni0uNTYuNi4wNiAxLjMuMzUgMS45LjcuMjguMjMuNTMuNDMuNy40OC0xLjkuNDctMi41MyAxLjc4LTIuOCAyLjkyeiIvPg0KICA8cGF0aCBmaWxsPSIjYWZhZmFmIiBkPSJNNTkuNDcgNTIuOThjMS4zNS0uNTcgMy4yOS0uMjcgNC45Ni45NWwuMTEuMDlhMTAgMTAgMCAwIDAtMi40Mi4wOGMtLjExLS4xLS43Ny0uNDUtLjc1LS40M2E0LjkgNC45IDAgMCAwLTEuOS0uN3oiLz4NCiAgPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNzE3MTcxIiBzdHJva2Utd2lkdGg9Ii4xMSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGQ9Ik01OS40NyA1Mi45OGMxLjM1LS41NyAzLjI5LS4yNyA0Ljk2Ljk1bC4xMS4wOWMyLjAzIDEuNTQgMy43NyA0LjYyIDEuMTggNS44LTIuMDQuOTMtMy41NC43OC00LjcyLS40OWExNS4yNyAxNS4yNyAwIDAgMS0xLjczLTIuMjZjLS44OS0xLjQ0LTEuMzUtMi44Ny0uNjYtMy41My4yNC0uMjQuNTQtLjQzLjg2LS41NnoiLz4NCiAgPHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNzE3MTcxIiBzdHJva2Utd2lkdGg9Ii4xMSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGQ9Ik02Mi4wOSA1NC4xNmwuMjYtLjA2Yy42LS4xMiAxLjMzLS4xNSAyLjItLjA5bS01LjI4IDMuMDd2LS4wMWMuMjctMS4xNC45LTIuNDQgMi44Mi0yLjkxbS0uNzItLjQ5YTQuOSA0LjkgMCAwIDAtMS45LS43bTIuNjIgMS4xOWE1LjYgNS42IDAgMCAwLS43MS0uNDgiLz4NCiAgPHBhdGggZmlsbD0iIzRENEQ0RCIgZD0iTTYxLjU3IDUzLjVjLjM1LjI2LjQ0LjQ4LjU1LjZsLS4yNi4wNmMtLjM2LS40LTEtLjY3LS45Ni0uNzMuMS0uMTQuNDctLjA4LjY3LjA3eiIvPg0KPC9zdmc+`
}
