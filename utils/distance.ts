/**
 * Calculate distance between two geographic points using Haversine formula
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format distance to human-readable string
 * @param distanceKm - Distance in kilometers
 * @returns Formatted distance string (e.g., "2.3km away" or "500m away")
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m away`;
  } else {
    return `${distanceKm.toFixed(1)}km away`;
  }
}

/**
 * Calculate distance and return formatted string
 * @param userLat - User's latitude
 * @param userLon - User's longitude
 * @param eventLat - Event's latitude
 * @param eventLon - Event's longitude
 * @returns Formatted distance string or empty string if calculation fails
 */
export function getFormattedDistance(
  userLat: number,
  userLon: number,
  eventLat: number,
  eventLon: number
): string {
  try {
    const distKm = calculateDistance(userLat, userLon, eventLat, eventLon);
    return formatDistance(distKm);
  } catch {
    return "";
  }
}

/**
 * Estimate travel time based on distance
 * @param distanceKm - Distance in kilometers
 * @param avgSpeedKmh - Average speed in km/h (default: 40 km/h for city driving)
 * @returns Formatted travel time string (e.g., "15 min" or "1h 30m")
 */
export function estimateTravelTime(distanceKm: number, avgSpeedKmh: number = 40): string {
  const timeHours = distanceKm / avgSpeedKmh;
  const timeMinutes = Math.round(timeHours * 60);
  
  if (timeMinutes < 1) {
    return "< 1 min";
  } else if (timeMinutes < 60) {
    return `${timeMinutes} min`;
  } else {
    const hours = Math.floor(timeMinutes / 60);
    const mins = timeMinutes % 60;
    return `${hours}h ${mins}m`;
  }
}

