const socket = io();

// Server (emit) -> client (receive) --acknowledge ---> server
// client(emit) -> server(receive) --acknowledge --> client

// socket.on("countUpdated", (count) => {
//   console.log("The count has been updated ", count);
// });

// document.querySelector("#increment").addEventListener("click", () => {
//   console.log("Clicked");
//   socket.emit("increment");
// });

//Elements
const $messagForm = document.querySelector("#message-form");
const $messagFormInput = $messagForm.querySelector("input");
const $messagFormButton = $messagForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  //Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //visible height
  const visibleHeight = $messages.offsetHeight;

  //Height of message container

  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled?

  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (msg) => {
  const html = Mustache.render(messageTemplate, {
    username: msg.username,
    message: msg.text,
    createdAt: moment(msg.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationmessage", (message) => {
  const html = Mustache.render(locationMessageTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

$messagForm.addEventListener("submit", (event) => {
  event.preventDefault();
  $messagFormButton.setAttribute("disabled", "disabled");
  //disable
  const message = event.target.elements.message.value;
  socket.emit("sendMessage", message, (error) => {
    $messagFormButton.removeAttribute("disabled");
    $messagFormInput.value = "";
    $messagFormInput.focus();
    //enable
    if (error) {
      return console.log(error);
    }
    console.log("Message delivered");
  });
});

$sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) return alert("Geolocation not supported");
  $sendLocationButton.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    console.log(position);
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $sendLocationButton.removeAttribute("disabled");
        console.log("Location SAvedd");
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
