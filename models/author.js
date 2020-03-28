const mongoose = require("mongoose");
const moment = require("moment");

const Schema = mongoose.Schema;

let AuthorSchema = new Schema({
  first_name: { type: String, required: true, max: 100 },
  family_name: { type: String, required: true, max: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date }
});

// Virtual for author's full name
AuthorSchema.virtual("name").get(function() {
  let fullname = "";
  if (this.first_name && this.family_name) {
    fullname = this.family_name + ", " + this.first_name;
  }
  if (!this.first_name || !this.family_name) {
    fullname = "";
  }

  return fullname;
});

// Virtual for author's URL
AuthorSchema.virtual("url").get(function() {
  return "/catalog/author/" + this._id;
});

// Virtual for author's dates
AuthorSchema.virtual("date_of_birth_formatted").get(function() {
  return this.date_of_birth
    ? moment(this.date_of_birth).format("MMMM Do, YYYY")
    : "";
});

AuthorSchema.virtual("date_of_death_formatted").get(function() {
  return this.date_of_death
    ? moment(this.date_of_death).format("MMMM Do, YYYY")
    : "";
});

// Virtual for author's update
AuthorSchema.virtual("date_of_birth_update").get(function() {
  return this.date_of_birth
    ? moment(this.date_of_birth).format("YYYY-MM-DD")
    : "";
});

AuthorSchema.virtual("date_of_death_update").get(function() {
  return this.date_of_death
    ? moment(this.date_of_death).format("YYYY-MM-DD")
    : "";
});

//Export model
module.exports = mongoose.model("Author", AuthorSchema);
