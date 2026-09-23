export function calculateDistance(
  latitude1,
  longitude1,
  latitude2,
  longitude2
) {
  if (
    latitude1 == null ||
    longitude1 == null ||
    latitude2 == null ||
    longitude2 == null
  ) {
    return null;
  }

  const earthRadius = 6371;

  const lat1 = (latitude1 * Math.PI) / 180;
  const lat2 = (latitude2 * Math.PI) / 180;

  const differenceLatitude =
    ((latitude2 - latitude1) * Math.PI) / 180;

  const differenceLongitude =
    ((longitude2 - longitude1) * Math.PI) / 180;

  const a =
    Math.sin(differenceLatitude / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(differenceLongitude / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}

export function formatDistance(distance) {
  if (distance === null) {
    return "Distance unavailable";
  }

  if (distance < 1) {
    return `${Math.round(distance * 1000)} m away`;
  }

  return `${distance.toFixed(1)} km away`;
}