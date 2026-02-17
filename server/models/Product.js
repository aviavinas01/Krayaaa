const mongoose = require('mongoose');

// A Mongoose Schema defines the structure of the document,
// default values, validators, etc.
const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: {
        type: String,
        required: true, // The name is a mandatory field
        trim: true      // Removes whitespace from both ends of a string
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0          // Price cannot be a negative number
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    imageUrls: {
        type: [String],
        required: false // An image is not strictly required to create a listing initially
    },
    // We can add a reference to the user who posted the item later
      user: {
          type: String,
          ref: 'User',
          required: true
       }
}, {
    // The timestamps option automatically adds createdAt and updatedAt fields
    timestamps: true,
});

// A Mongoose Model provides an interface to the database for creating,
// querying, updating, deleting records, etc.
const Product = mongoose.model('Product', productSchema);

module.exports = Product;