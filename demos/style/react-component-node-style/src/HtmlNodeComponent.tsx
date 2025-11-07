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
import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  Typography
} from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import OpenInNew from '@mui/icons-material/Favorite'
import ShareIcon from '@mui/icons-material/Share'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { ReactComponentHtmlNodeStyleProps } from './ReactComponentHtmlNodeStyle'

const darkTheme = createTheme({ palette: { mode: 'dark' } })

type NodeComponentProps = {
  color: string
  content: string
  image: string
  name: string
  moreUrl?: string
}

export function HtmlNodeComponent({ tag }: ReactComponentHtmlNodeStyleProps<NodeComponentProps>) {
  const { color, content, image, name, moreUrl } = tag

  return (
    <ThemeProvider theme={darkTheme}>
      <Card
        sx={{ bgcolor: color, height: '100%', display: 'flex', flexDirection: 'column' }}
        className="node-card"
        raised
      >
        <CardHeader
          avatar={<Avatar src={image} />}
          action={
            <IconButton>
              <MoreVertIcon />
            </IconButton>
          }
          title={name}
        />
        <CardContent sx={{ maxHeight: '200px', overflowY: 'auto' }}>
          <Typography variant="body2" color="text.secondary">
            {content}
          </Typography>
        </CardContent>
        <CardActions disableSpacing sx={{ marginTop: 'auto', display: 'flex' }}>
          <IconButton>
            <FavoriteIcon />
          </IconButton>
          <IconButton>
            <ShareIcon />
          </IconButton>
          {moreUrl && (
            <Button
              variant="contained"
              endIcon={<OpenInNew />}
              sx={{ marginLeft: 'auto' }}
              href={moreUrl}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              Learn more
            </Button>
          )}
        </CardActions>
      </Card>
    </ThemeProvider>
  )
}
