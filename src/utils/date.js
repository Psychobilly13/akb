function genUnixTs() {
  return Math.round((Math.round(new Date().getTime())) / 1000);
}

module.exports = {genUnixTs};
