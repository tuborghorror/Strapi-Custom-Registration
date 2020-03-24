"use strict";

/**
 * User.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const bcrypt = require("bcryptjs");
const _ = require("lodash");

module.exports = {
  /**
   * Promise to add a/an user.
   * @return {Promise}
   */
  async add(values) {
    if (values.password) {
      values.password = await strapi.plugins[
        "users-permissions"
      ].services.user.hashPassword(values);
    }

    return strapi.query("user", "users-permissions").create(values);
  },

  /**
   * Promise to edit a/an user.
   * @return {Promise}
   */
  async edit(params, values) {
    // Note: The current method will return the full response of Mongo.
    // To get the updated object, you have to execute the `findOne()` method
    // or use the `findOneOrUpdate()` method with `{ new:true }` option.
    if (values.password) {
      values.password = await strapi.plugins[
        "users-permissions"
      ].services.user.hashPassword(values);
    }

    return strapi.query("user", "users-permissions").update(params, values);
  },

  /**
   * Promise to fetch a/an user.
   * @return {Promise}
   */
  fetch(params, populate) {
    return strapi.query("user", "users-permissions").findOne(params, populate);
  },

  /**
   * Promise to fetch all users.
   * @return {Promise}
   */
  fetchAll(params, populate) {
    return strapi.query("user", "users-permissions").find(params, populate);
  },

  hashPassword(user = {}) {
    return new Promise(resolve => {
      if (!user.password || this.isHashed(user.password)) {
        resolve(null);
      } else {
        bcrypt.hash(`${user.password}`, 10, (err, hash) => {
          resolve(hash);
        });
      }
    });
  },

  isHashed(password) {
    if (typeof password !== "string" || !password) {
      return false;
    }

    return password.split("$").length === 4;
  },

  /**
   * Promise to remove a/an user.
   * @return {Promise}
   */
  async remove(params) {
    return strapi.query("user", "users-permissions").delete(params);
  },

  async removeAll(params, query) {
    const toRemove = Object.values(_.omit(query, "source"));
    const { primaryKey } = strapi.query("user", "users-permissions");
    const filter = { [`${primaryKey}_in`]: toRemove, _limit: 100 };

    return strapi.query("user", "users-permissions").delete(filter);
  },

  validatePassword(password, hash) {
    return bcrypt.compareSync(password, hash);
  }
};
