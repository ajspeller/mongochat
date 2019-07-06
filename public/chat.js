const element = (id) => {
  return document.querySelector(`#${id}`);
};

// dom elements
const status = element('status');
const chat = element('chat');
const username = element('username');
const messages = element('messages');
const textarea = element('textarea');
const clearButton = element('clear');

// set default status
const statusDefault = status.textContent;
const setStatus = (status) => {
  status.textContent = status;

  if (status !== statusDefault) {
    const delay = setTimeout(() => {
      setStatus(statusDefault);
    }, 4000);
  }
};

// connect to socket.io
const socket = io.connect('http://localhost:3000');

// check for connection
socket.on('output', (data) => {
  if (data.length) {
    data.map((_data) => {
      const message = document.createElement('div');
      message.setAttribute('class', 'chat-message');
      message.textContent = `${_data.name}: ${_data.message}`;
      messages.appendChild(message);
      messages.insertBefore(message, messages.firstChild);
    });
  }
});

// get status
socket.on('status', (data) => {
  // get message status
  setStatus(typeof data === 'object' ? data.message : data);
  if (data.clear) {
    textarea.value = '';
  }
});

// handle input
textarea.addEventListener('keydown', (e) => {
  if (e.which === 13 && event.shiftKey === false) {
    socket.emit('input', {
      name: username.value,
      message: textarea.value
    });
    e.preventDefault();
  }
});

// handle chat clear
clearButton.addEventListener('click', (e) => {
  socket.emit('clear');
});

// clear message
socket.on('cleared', () => {
  messages.textContent = '';
});
