import {
  initClient,
  closeClient,
  getVersion,
  getGlobalOption,
  getGlobalStat,
  fetchTaskList
} from "../../src/renderer/api";

describe("renderer/api", () => {
  it("should open success", async () => {
    await initClient();
  });

  it("should get version success", async () => {
    console.log(await getVersion());
    // {
    //   enabledFeatures: [
    //     'Async DNS',
    //     'BitTorrent',
    //     'Firefox3 Cookie',
    //     'GZip',
    //     'HTTPS',
    //     'Message Digest',
    //     'Metalink',
    //     'XML-RPC',
    //     'SFTP'
    //   ],
    //   version: '1.34.0'
    // }
  });

  it("should getGlobalOption success", async () => {
    console.log(await getGlobalOption());
    // {
    //   'allow-overwrite': 'false',
    //   'allow-piece-length-change': 'false',
    //   'always-resume': 'true',
    //   'async-dns': 'true',
    //   'auto-file-renaming': 'true',
    //   'auto-save-interval': '60',
    //   'bt-detach-seed-only': 'false',
    //   'bt-enable-hook-after-hash-check': 'true',
    //   ...
    // }
  });

  it("should getGlobalStat success", async () => {
    console.log(await getGlobalStat());
    // {
    //   downloadSpeed: '0',
    //   numActive: '0',
    //   numStopped: '0',
    //   numStoppedTotal: '0',
    //   numWaiting: '0',
    //   uploadSpeed: '0'
    // }
  });

  it("should fetchTaskList success", async () => {
    console.log(await fetchTaskList({ type: "active" }));
    // [
    //   {
    //     bitfield: "ffffff807fffff0000",
    //     completedLength: "51412992",
    //     connections: "2",
    //     dir: "/home/su/",
    //     downloadSpeed: "0",
    //     files: [
    //       {
    //         completedLength: "50331648",
    //         index: "1",
    //         length: "68551795",
    //         path: "/home/su//4k_loop.webm",
    //         selected: "true",
    //         uris: [Array]
    //       }
    //     ],
    //     gid: "d27ac5988c1b2d93",
    //     numPieces: "66",
    //     pieceLength: "1048576",
    //     status: "active",
    //     totalLength: "68551795",
    //     uploadLength: "0",
    //     uploadSpeed: "0"
    //   }
    // ];
    console.log(await fetchTaskList({ type: "waiting" }));
    // [
    //   {
    //     bitfield: 'f00000007800000000',
    //     completedLength: '10207232',
    //     connections: '0',
    //     dir: '/home/su/',
    //     downloadSpeed: '0',
    //     files: [ [Object] ],
    //     gid: 'd27ac5988c1b2d93',
    //     numPieces: '66',
    //     pieceLength: '1048576',
    //     status: 'paused',
    //     totalLength: '68551795',
    //     uploadLength: '0',
    //     uploadSpeed: '0'
    //   }
    // ]
    console.log(await fetchTaskList({ type: "stopped" }));
    // [
    //   {
    //     bitfield: 'fffffc',
    //     completedLength: '22780737',
    //     connections: '0',
    //     dir: '/home/su/',
    //     downloadSpeed: '0',
    //     errorCode: '0',
    //     errorMessage: '',
    //     files: [ [Object] ],
    //     gid: 'a206f88d82fba954',
    //     numPieces: '22',
    //     pieceLength: '1048576',
    //     status: 'complete',
    //     totalLength: '22780737',
    //     uploadLength: '0',
    //     uploadSpeed: '0'
    //   }
    // ]
  });

  it("should close success", async () => {
    await closeClient();
  });
});
