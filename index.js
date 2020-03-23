"use strict";
const EventEmitter = require("events").EventEmitter;
const _ = require("lodash");

class Sharp extends EventEmitter {
  constructor() {
    super();
    this.interval = 1000 / 30;
    this.current = location.hash;
    this.last = this.current;
    this.enabledEscapedFragment = false;
    this.keyValSeparator = "=";
    this.paramSeparator = "&";
  }

  watch() {
    this.emit("watch", this);
    this.watcher = setInterval( () => {
      this.checkHash();
    }, this.interval);
  }

  stop() {
    clearInterval(this.watcher);
    this.emit("stop", this);
  }

  checkHash() {
    this.current = location.hash;
    this.emit("checkHash", this);
    if( this.last !== this.current) {
      this.change();
    }
    this.last = this.current;
  }

  change( hash = false ) {
    if( hash ) {
      location.hash = this.toHashFormat(hash);
      this.current = location.hash;
    } else {
      this.emit("change", this);
    }
  }

  plain() {
    return this.current.replace(/^#\!*/, "");
  }

  parsed() {
    let result = {}
    _.each( this.plain().split(this.paramSeparator), (str) => {
      let arr = str.split(this.keyValSeparator);
      if( arr.length === 1 ) {
        result[str] = str;
      } else {
        result[arr[0]] = arr[1]
      }
    })
    return result;
  }

  toHashFormat( str ) {
    if( _.isPlainObject(str) ) {
      let s = "";
      _.each(str, (val, key) => {
        s+= `${key}${this.keyValSeparator}${val}${this.paramSeparator}`;
      });
      let regexp = new RegExp(`${this.paramSeparator}$`);
      str = s.replace(regexp, "");
    }
    if( this.enabledEscapedFragment ) {
      if( str.match(/^#(?!\!)/) ) {
        return str.replace(/^#/,`#!`);
      } else if( str.match(/^(?!#)/) ) {
        return `#!${str}`;
      } else if( str.match(/^#\!/) ) {
        return str;
      } else {
        console.error(`String [${str}] is illegal.`);
      }
    } else {
      if( str.match(/^#/) ) {
        return str;
      } else {
        return `#${str}`;
      }
    }
  }
}

module.exports = new Sharp;
