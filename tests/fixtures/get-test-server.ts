import fakeSnippetsApiBundle from "@tscircuit/fake-snippets"
import fakeRedditApiBundle from "@tscircuit/fake-reddit"
import { getNodeHandler } from "winterspec/adapters/node"


export const getTestServer = () => {
  // Start both the fakes

  // const port = await getPort()
  // const nodeHandler = getNodeHandler(fakeJlcpcbBundle, {
  //   port,
  // })

  // const server = http.createServer((req, res) => {
  //   nodeHandler(req, res)
  // })

  // await new Promise<void>((resolve) => {
  //   server.listen(port, () => {
  //     resolve()
  //   })
  // })

  // return {
  //   port,
  //   server,
  //   url: `http://localhost:${port}`,
  // }
}
