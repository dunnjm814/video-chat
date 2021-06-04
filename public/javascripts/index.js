window.addEventListener("DOMContentLoaded", (e) => {
  e.preventDefault();

  const roomForm = document.getElementById('make-room')
  const connect = document.getElementById('submit-room')
  const roomName = document.getElementById('room-name')
  const roomHostName = document.getElementById('host-name')
  const url = window.location.href

  connect.addEventListener("click", e => {
    e.preventDefault();
    const info = new FormData(roomForm)
    console.log(url, info)
  })
})
