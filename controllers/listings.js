// controllers/listings.js
const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
  let filter = {};
  const currentCategory = req.query.category || "";

  // Check karein ki URL mein ?category=... hai ya nahi
  if (currentCategory) {
    filter.category = currentCategory;
  }

  // Pehle query banayein
  let query = Listing.find(filter);
  // Agar category select ki gayi hai, toh limit lagayein
  if (currentCategory) {
    query = query.limit(2);
  }
  // Ab aakhri query ko run karein
  const allListings = await query;
  if (allListings.length === 0 && currentCategory) {
    req.flash("error", `No listings found for the category: ${currentCategory}`);
    return res.redirect("/listings");
  }
  // Controller ab 'currentCategory' bhi view ko bhejega
  res.render("listings/index.ejs", { allListings, currentCategory });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  if (req.file) {
    newListing.image = { url: req.file.path, filename: req.file.filename };
  }
  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image && listing.image.url
    ? listing.image.url.replace("/upload", "/upload/w_250")
    : null;
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (req.file) {
    listing.image = { url: req.file.path, filename: req.file.filename };
    await listing.save();
  }
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};

module.exports.searchListings = async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.redirect("/listings");
  }
  const allListings = await Listing.find({
    $or: [
      { title: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
      { country: { $regex: q, $options: "i" } },
    ],
  });
  if (allListings.length > 0) {
    res.render("listings/index.ejs", { allListings, currentCategory: "" });
  } else {
    req.flash("error", `No listings found matching your search for "${q}"`);
    res.redirect("/listings");
  }
};