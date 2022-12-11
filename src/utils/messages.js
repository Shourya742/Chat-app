const generateMessage = (username, text) => {
  return {
    username: username,
    text,
    createdAt: new Date().getTime(),
  };
};

const generateLocationMesssage = (username, url) => {
  return {
    username: username,
    url: url,
    createdAt: new Date().getTime(),
  };
};
module.exports = {
  generateMessage,
  generateLocationMesssage,
};
