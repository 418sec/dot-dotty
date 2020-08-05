/**
 * A module that provides a simple Proxy wrapper for dot-syntax access.
 * @module DotDotty
 */ 

 /**
  * DotDotty return a Proxy against the given target object that can access properties via dot-syntax.
  * @kind function
  * @name DotDotty
  * @example
  * const DotDotty = require('dot-dotty')
  * 
  * let myData = {a: 1, b: 2}
  * 
  * let dot = DotDotty(myData)
  * 
  * dot["a"] // returns 1
  * 
  * dot["c.cA"] = true // returns true
  * 
  * // dot now contains {a: 1, b:2, c: {cA: true}}
  * 
  * dot["d.0.a"] = "test" // returns "test"
  * 
  * // dot now contains {a: 1, b:2, c: {cA: true}, d: [{a: test}]}
  * 
  * @param {Object} target The target object to proxy DotDotty against.
  * @param {Object} options
  * @param {Boolean} [options.isImmutable=false] Whether or not the target object should be changeable.
  * @param {Boolean} [options.isExpandable=true] Whether or not new values may be placed into the object. These include new array entries and new object entries.
  * @param {Boolean} [options.throwErrors=true] Whether or not to throw errors when invalid access or expansion occurs. If false, invalid access or expansion will return undefined.
  * @returns {Proxy} A proxy to the target object that can use dot-notation to access or create properties.
  */
const DotDotty = function(target, {isImmutable=false,isExpandable=true,throwErrors=true}={}) {
  return new Proxy(target, {
    get: (obj, prop) => {
      let parts = prop.split('.')
      for (let i = 0; i < parts.length; i++) {
        let part = parts[i]
        obj = obj[part]
        if (obj === undefined) {
          if (throwErrors) {
            if (i === 0) {
              throw new Error(`invalid target "${part}"\n${prop}\n^`)
            } else {
              throw new Error(`invalid target "${part}" in "${parts.slice(0, i).join('.')}"\n${prop}\n${" ".repeat(parts.slice(0, i).join('.').length)}^`)
            }
          }
          return undefined
        }
      }
      return obj
    },
    set: (obj, prop, value) => {
      if (isImmutable) return
      let parts = prop.split('.')
      let prevPart
      for (let i = 0; i < parts.length-1; i++) {
        let part = parts[i]
        if (!isNaN(part)) {
          part = Number(part)
        }
        let nextPart = parts[i+1]
        if (nextPart !== undefined && isExpandable) {
          if (!isNaN(nextPart)) {
            if (obj[part] === undefined || typeof obj[part] !== 'object') {
              obj[part] = []
            }
          } else {
            if (obj[part] === undefined || typeof obj[part] !== 'object') {
              obj[part] = {}
            }
          }
        }
        if (obj[part] === undefined) {
          if (throwErrors) {
            if (i === 0) {
              throw new Error(`invalid target "${part}"\n${prop}\n^`)
            } else {
              throw new Error(`invalid target "${part}" in "${parts.slice(0, i).join('.')}"\n${prop}\n${" ".repeat(parts.slice(0, i).join('.').length)}^`)
            }
          }
          return undefined
        }
        obj = obj[part]
        prevPart = part
      }
      if (obj[parts[parts.length-1]] === undefined) {
        if (!isExpandable) {
          if (throwErrors) {
            if (parts.length-1 === 0) {
              throw new Error(`invalid target "${parts[parts.length-1]}"\n${prop}\n^`)
            } else {
              throw new Error(`invalid target "${parts[parts.length-1]}" in "${parts.slice(0, parts.length-1).join('.')}"\n${prop}\n${" ".repeat(parts.slice(0, parts.length-1).join('.').length)}^`)
            }
          }
          return undefined
        }
      }
      return obj[parts[parts.length-1]] = value
    },
  })
}

/** DotDotty export */
export default DotDotty

