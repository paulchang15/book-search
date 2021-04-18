const { User } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      // return User.findOne({ username });

      const userData = await User.findOne({ _id: context.user._id });

      return userData;
    },
  },

  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },

    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError("no user with email!");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("no user with this pw!");
      }

      const token = signToken(user);
      return { token, user };
    },

    saveBook: async (parent, { user }, { bookData }) => {
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $addToSet: { savedBooks: bookData } },
          { new: true, runValidators: true }
        );

        return updatedUser;
      } catch (e) {
        console.log(e);
        return res.status(400);
      }
    },

    deleteBook: async (parent, { user }, { bookId }) => {
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );
      if (!updatedUser) {
        throw new AuthenticationError("No book ID found!");
      }
      return updatedUser;
    },
  },
};

module.exports = resolvers;
