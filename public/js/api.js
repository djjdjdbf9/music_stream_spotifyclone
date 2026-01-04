class API {
  static async getTracks() {
    const response = await fetch('/api/tracks');
    return response.json();
  }

  static async getTrack(id) {
    const response = await fetch(`/api/tracks/${id}`);
    return response.json();
  }

  static async deleteTrack(id) {
    const response = await fetch(`/api/tracks/${id}`, { method: 'DELETE' });
    return response.json();
  }
}