const notifyUser = (io, userId, message, data) => {
  try {
    const userSocket = io.sockets.sockets.get(userId); // Assuming userId maps to socket ID
    if (userSocket) {
      userSocket.emit('notification', { message, data });
      console.log(`Notification sent to userId: ${userId} - Message: ${message}`);
    } else {
      console.log(`User with userId: ${userId} is not connected`);
    }
  } catch (error) {
    console.error(`Failed to notify userId: ${userId} - Error: ${error.message}`);
  }
};

module.exports = { notifyUser };
