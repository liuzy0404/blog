let url = $request.url;
let hasUid = (url) => url.includes("uid");
let getUid = (url) => (hasUid(url) ? url.match(/uid=(\d+)/)[1] : undefined);

if (url.includes("users/show")) {
  $persistentStore.write(getUid(url), "weibouid");
  $done({});
} else if (url.includes("profile/statuses/tab")) {
  try {
    let data = JSON.parse($response.body);
    let statuses = data.cards
      .map((card) => (card.card_group ? card.card_group : card))
      .flat()
      .filter((card) => card.card_type === 9)
      .map((card) => card.mblog)
      .map((status) =>
        status.isTop
          ? {
              ...status,
              label: "置顶",
            }
          : status
      );
    let sinceId = data.cardlistInfo.since_id;
    $done({
      body: JSON.stringify({
        statuses,
        since_id: sinceId,
        total_number: 100,
      }),
    });
  } catch {
    console.log("Parsing failed");
    $done({});
  }
} else if (url.includes("statuses/user_timeline")) {
  let uid = getUid(url) || $persistentStore.read("weibouid");
  url = url.replace("statuses/user_timeline", "profile/statuses/tab").replace("max_id", "since_id");
  url = url + `&containerid=230413${uid}_-_WEIBO_SECOND_PROFILE_WEIBO`;
  $done({
    url,
  });
} else {
  $done({});
}


/* surge local module
#!name=vvebo
#!desc=修复 vvebo 用户主页显示问题（适配卡片式 API）

[Script]
fix-vvebo-user-show = type=http-request, pattern=^https://api.weibo.cn/2/users/show?, max-size=1048576, script-path=https://raw.githubusercontent.com/liuzy0404/blog/refs/heads/master/vvebo.js
fix-vvebo-user-timeline = type=http-request, pattern=^https://api.weibo.cn/2/statuses/user_timeline?, max-size=1048576, script-path=https://raw.githubusercontent.com/liuzy0404/blog/refs/heads/master/vvebo.js
fix-vvebo-user-unread-count = type=http-request, pattern=^https://api.weibo.cn/2/remind/unread_count?, max-size=1048576, script-path=https://raw.githubusercontent.com/liuzy0404/blog/refs/heads/master/vvebo.js
fix-vvebo-user-profile = type=http-response, pattern=^https://api.weibo.cn/2/profile/statuses/tab?, max-size=5242880, script-path=https://raw.githubusercontent.com/liuzy0404/blog/refs/heads/master/vvebo.js, requires-body=true
fix-vvebo-user-cardlist = type=http-response, pattern=^https://api.weibo.cn/2/cardlist?, max-size=5242880, script-path=https://raw.githubusercontent.com/liuzy0404/blog/refs/heads/master/vvebo.js, requires-body=true
[MITM]
hostname = api.weibo.cn

[Variable]
# 可选：用于调试时查看当前 UID
weibouid = string
*/