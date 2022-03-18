import { microblog3 } from "../../declarations/microblog3";
import {Principal} from "@dfinity/principal";

async function refresh_name() {
  let name = "";
  try {
    name = await microblog3.get_name();
    if (name.length === 0) {
      name = "";
    } else {
      name = name[0];
    }
  } catch (e) {
    alert(e.name + ": " + e.message);
  }
  $("#author").html("Hello " + name + "!");
}

async function get_follow_name(id) {
  let name = "";
  try {
    name = await microblog3.follow_name(Principal.fromText(id));
  } catch (e) {
    alert(e.name + ": " + e.message);
    return name;
  }
  if (name.length === 0) {
    name = "";
  } else {
    name = name[0];
  }
  return name;
}

async function set_name() {
  let name = $("#changeName").val();
  let button = $("#saveName");
  button.attr("disabled", true);
  try {
    await microblog3.set_name(name);
    alert("success");
  } catch (e) {
    alert(JSON.stringify(e));
  }
  button.attr("disabled", false);
  refresh_name();
  setTimeout(refresh_name, 5000);
  setTimeout(refresh_name, 10000);
}

async function follow() {
  let id = $("#follow").val();
  let button = $("#saveFollow");
  button.attr("disabled", true);
  try {
    await microblog3.follow(Principal.fromText(id));
    alert("success");
  } catch (e) {
    alert("error: invalid principal");
  }
  button.attr("disabled", false);
  await show_follow();
}

async function show_follow() {
  let follows;
  try {
    follows = await microblog3.follows();
  } catch (e) {
    alert(e.name + ": " + e.message);
    return;
  }
  let res = "";
  let follow_section = $("#follows");
  for (let i = 0; i < follows.length; i++) {
    let id = follows[i].toText();
    let name = await get_follow_name(id);
    res = res + "<div><details><summary>" + name + "[" + id + "]</summary><ul id=\"" + id+ "\"></ul></details></div>";
  }
  follow_section.html(res);

  $("#follows summary").each(function () {
    $(this).click(async function () {
      try {
        let ul = $(this).next();
        if (typeof ul.parent().attr("open") == "undefined") {
          let id = ul.attr("id");
          let posts = await microblog3.follow_posts(Principal.fromText(id));
          let li = "";
          for (let i = 0; i < posts.length; i++) {
            let time = new Date(Math.floor(Number(posts[i].time / 1000000n)));
            li = li + "<li>[author:" + posts[i].author + "][time:" + time.toLocaleString() + "][text:"
                + posts[i].text + "]</li>";
          }
          ul.html(li);
        }
      } catch (e) {
        alert(e.name + ": " + e.message);
      }
    });
  });
}

async function post() {
  let msg = $("#message").val();
  let button = $("#post");
  button.attr("disabled", true);
  try {
    await microblog3.post(msg);
    alert("success");
  } catch (e) {
    alert(JSON.stringify(e));
  }
  button.attr("disabled", false);
  load_posts();
}

async function load_posts() {
  let since = $("#sinceTime").val();
  if (since == null || since === "")  {
    since = 0n;
  } else {
    try {
      since = BigInt(since);
    } catch (e) {
      alert("invalid number");
      return;
    }
  }
  try {
    let posts_section = $("#myPosts");
    let posts = await microblog3.posts(since);
    let li = "";
    if (posts != null) {
      for (let i = 0; i < posts.length; i++) {
        let time = new Date(Math.floor(Number(posts[i].time / 1000000n)));
        li = li + "<li>[author:" + posts[i].author + "][time:" + time.toLocaleString() + "][text:"
            + posts[i].text + "]</li>";
      }
    }
    posts_section.html(li);
  } catch (e) {
    alert(e.name + ": " + e.message);
  }
}

async function timeline() {
  let since = $("#sinceTime").val();
  if (since == null || since === "")  {
    since = 0n;
  } else {
    try {
      since = BigInt(since);
    } catch (e) {
      alert("invalid number");
      return;
    }
  }
  try {
    let timeline_section = $("#timeline");
    let timeline = await microblog3.timeline(since);
    let li = "";
    if (timeline != null) {
      for (let i = 0; i < timeline.length; i++) {
        let time = new Date(Math.floor(Number(timeline[i].time / 1000000n)));
        li = li + "<li>[author:" + timeline[i].author + "][time:" + time.toLocaleString() + "][text:"
            + timeline[i].text + "]</li>";
      }
    }
    timeline_section.html(li);
  } catch (e) {
    alert(e.name + ": " + e.message);
  }
}

function load() {
  $("#refreshPosts").click(load_posts);
  $("#refreshTimeline").click(timeline);
  $("#post").click(post);
  $("#saveName").click(set_name);
  $("#saveFollow").click(follow);
  $("#sinceTime").attr("placeholder", new Date().getTime().toString() + "000");
  refresh_name();
  load_posts();
  show_follow();
}

$(document).ready(load);
