"use strict";

function TourController(tourId) {
  var vm = this;

  vm.tourId = tourId;
}

module.exports = ["tourId", TourController];
