const tlsClient = require("./tls");
const apis = require("./hanime_api");

async function getMeta(autohority, id) {
    try {
      const {response, destroy} = tlsClient.request({
        url: `https://${autohority}/api/v8/video?id=${id}&`,
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
        }
      });
      
      const meta = JSON.parse(response.body);
      
      destroy();

      return meta.hentai_video;
    } catch (error) {
      console.error(error);
    }
  }

async function getSearch(query, tags, orderBy, ordering, page) {
  const output = await apis.hanime.api.query.search(query, tags, orderBy, ordering, page)
  const remove_bars = JSON.parse(output)
  const resp = JSON.parse(remove_bars.hits)
  return resp
}

async function getStream(autohority, slug) {
    const videoInfo = await apis.hanime.api.video.getVideoMedia(autohority, slug)
    return videoInfo
}

var hanime =  hanime || {};
hanime.addon = hanime.addon || {};
hanime.addon.getStream = getStream;
hanime.addon.getSearch = getSearch;
hanime.addon.getMeta = getMeta;

module.exports = { hanime }
  