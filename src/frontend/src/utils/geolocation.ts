export interface GeoPosition {
  lat: number;
  lng: number;
}

export async function getCurrentPosition(timeout = 5000): Promise<GeoPosition | null> {
  if (!navigator.geolocation) return null;

  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout,
        maximumAge: 0,
      });
    });
    return {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
    };
  } catch {
    return null;
  }
}
