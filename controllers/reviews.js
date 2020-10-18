const asyncHandler = require("../middleware/async");
const Review = require("../models/Review");
const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");

//@desc     Get Reviews
//@route    GET /api/v1/reviews
//@route    GET /api/v1/bootcamps/:bootcampId/reviews
//@access   Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advanceResults);
  }
});

//@desc     Get Single Review
//@route    GET /api/v1/reviews/:id
//@access   Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name descriptin",
  });

  if (!review) {
    return next(new ErrorResponse("Not Found", 400));
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});

//@desc     Create Review
//@route    POST /api/v1/review
//@access   Private
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.body.bootcamp);

  if (!bootcamp) {
    return res.status(400).json({ success: false });
  }

  const review = await Review.create(req.body);

  res.status(200).json({
    success: true,
    data: review,
  });
});

//@desc     Update Review
//@route    Put /api/v1/review
//@access   Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse("Review Not Found", 404));
  }

  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse("You can not delete another review"), 401);
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: review,
  });
});

//@desc     Delete Review
//@route    Delete /api/v1/review
//@access   Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse("Review Not Found", 404));
  }

  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse("You can not delete another review"), 401);
  }

  await Review.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
  });
});
