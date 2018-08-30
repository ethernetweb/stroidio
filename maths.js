exports.random = function(min, max) {
    return (Math.random() * max) + min;
}
exports.constrain = function(n, low, high) {
  return Math.max(Math.min(n, high), low);
};
