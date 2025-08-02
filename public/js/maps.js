// Google Maps Integration for Blood Bank Management System
class MapsManager {
    constructor() {
        this.map = null;
        this.markers = [];
        this.userLocation = null;
        this.bloodBanks = [];
        this.initializeMap();
    }

    // Initialize Google Maps
    async initializeMap() {
        // Check if Google Maps API is loaded
        if (typeof google === 'undefined') {
            console.log('Google Maps API not loaded yet');
            return;
        }

        try {
            // Get user's current location
            await this.getCurrentLocation();
            
            // Initialize map
            this.createMap();
            
            // Load nearby blood banks
            await this.loadNearbyBloodBanks();
            
        } catch (error) {
            console.error('Error initializing maps:', error);
            this.showLocationError();
        }
    }

    // Get user's current location
    getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    resolve(this.userLocation);
                },
                (error) => {
                    // Default to New York if location access denied
                    this.userLocation = { lat: 40.7128, lng: -74.0060 };
                    console.warn('Location access denied, using default location');
                    resolve(this.userLocation);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000
                }
            );
        });
    }

    // Create the map
    createMap() {
        const mapContainer = document.getElementById('map');
        if (!mapContainer) {
            console.error('Map container not found');
            return;
        }

        this.map = new google.maps.Map(mapContainer, {
            center: this.userLocation,
            zoom: 12,
            styles: [
                {
                    featureType: 'poi.medical',
                    elementType: 'geometry',
                    stylers: [{ color: '#e74c3c' }]
                }
            ]
        });

        // Add user location marker
        this.addUserLocationMarker();
    }

    // Add user location marker
    addUserLocationMarker() {
        if (!this.map || !this.userLocation) return;

        const userMarker = new google.maps.Marker({
            position: this.userLocation,
            map: this.map,
            title: 'Your Location',
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="8" fill="#3498db" stroke="#fff" stroke-width="2"/>
                        <circle cx="12" cy="12" r="3" fill="#fff"/>
                    </svg>
                `),
                scaledSize: new google.maps.Size(24, 24)
            }
        });

        this.markers.push(userMarker);
    }

    // Load nearby blood banks (sample data)
    async loadNearbyBloodBanks() {
        // Sample blood bank data (in production, this would come from your API)
        this.bloodBanks = [
            {
                id: 1,
                name: 'Central Blood Bank',
                address: '123 Medical Center Dr, New York, NY 10001',
                phone: '(555) 123-4567',
                hours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-4PM',
                position: { lat: 40.7589, lng: -73.9851 },
                bloodTypes: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
                urgentNeed: ['O-', 'AB+']
            },
            {
                id: 2,
                name: 'City Hospital Blood Center',
                address: '456 Health Ave, New York, NY 10002',
                phone: '(555) 234-5678',
                hours: '24/7 Emergency Services',
                position: { lat: 40.7282, lng: -73.9942 },
                bloodTypes: ['A+', 'B+', 'O+', 'O-'],
                urgentNeed: ['A-', 'B-']
            },
            {
                id: 3,
                name: 'Community Blood Drive Center',
                address: '789 Donor St, New York, NY 10003',
                phone: '(555) 345-6789',
                hours: 'Mon-Sat: 7AM-7PM',
                position: { lat: 40.7505, lng: -73.9934 },
                bloodTypes: ['A+', 'A-', 'B+', 'AB+', 'O+'],
                urgentNeed: ['O-']
            },
            {
                id: 4,
                name: 'University Medical Blood Bank',
                address: '321 Campus Rd, New York, NY 10004',
                phone: '(555) 456-7890',
                hours: 'Mon-Fri: 9AM-5PM',
                position: { lat: 40.7614, lng: -73.9776 },
                bloodTypes: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
                urgentNeed: ['AB-']
            }
        ];

        // Add markers for each blood bank
        this.addBloodBankMarkers();
    }

    // Add blood bank markers to map
    addBloodBankMarkers() {
        this.bloodBanks.forEach(bank => {
            const marker = new google.maps.Marker({
                position: bank.position,
                map: this.map,
                title: bank.name,
                icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="16" cy="16" r="14" fill="#e74c3c" stroke="#fff" stroke-width="2"/>
                            <path d="M16 8v16M8 16h16" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
                        </svg>
                    `),
                    scaledSize: new google.maps.Size(32, 32)
                }
            });

            // Create info window for each marker
            const infoWindow = new google.maps.InfoWindow({
                content: this.createInfoWindowContent(bank)
            });

            marker.addListener('click', () => {
                // Close all other info windows
                this.markers.forEach(m => {
                    if (m.infoWindow) {
                        m.infoWindow.close();
                    }
                });
                
                infoWindow.open(this.map, marker);
            });

            marker.infoWindow = infoWindow;
            this.markers.push(marker);
        });
    }

    // Create info window content for blood banks
    createInfoWindowContent(bank) {
        const urgentNeedHtml = bank.urgentNeed.length > 0 
            ? `<div class="urgent-need">
                <strong>🚨 Urgent Need:</strong> ${bank.urgentNeed.join(', ')}
               </div>`
            : '';

        return `
            <div class="blood-bank-info">
                <h3>${bank.name}</h3>
                <p><strong>📍 Address:</strong> ${bank.address}</p>
                <p><strong>📞 Phone:</strong> ${bank.phone}</p>
                <p><strong>🕒 Hours:</strong> ${bank.hours}</p>
                <p><strong>🩸 Available Types:</strong> ${bank.bloodTypes.join(', ')}</p>
                ${urgentNeedHtml}
                <div class="info-actions">
                    <button onclick="MapsManager.getDirections(${bank.position.lat}, ${bank.position.lng})" 
                            class="btn btn-primary btn-sm">
                        Get Directions
                    </button>
                    <button onclick="MapsManager.contactBloodBank('${bank.phone}')" 
                            class="btn btn-secondary btn-sm">
                        Call Now
                    </button>
                </div>
            </div>
        `;
    }

    // Get directions to a blood bank
    static getDirections(lat, lng) {
        const destination = `${lat},${lng}`;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
        window.open(url, '_blank');
    }

    // Contact blood bank
    static contactBloodBank(phone) {
        window.location.href = `tel:${phone}`;
    }

    // Search for blood banks by blood type
    filterByBloodType(bloodType) {
        // Clear existing markers
        this.clearMarkers();
        
        // Filter blood banks that have the required blood type
        const filteredBanks = this.bloodBanks.filter(bank => 
            bank.bloodTypes.includes(bloodType)
        );

        // Add user location marker back
        this.addUserLocationMarker();

        // Add filtered blood bank markers
        filteredBanks.forEach(bank => {
            const marker = new google.maps.Marker({
                position: bank.position,
                map: this.map,
                title: `${bank.name} - ${bloodType} Available`,
                icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="16" cy="16" r="14" fill="#27ae60" stroke="#fff" stroke-width="2"/>
                            <path d="M16 8v16M8 16h16" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
                        </svg>
                    `),
                    scaledSize: new google.maps.Size(32, 32)
                }
            });

            const infoWindow = new google.maps.InfoWindow({
                content: this.createInfoWindowContent(bank)
            });

            marker.addListener('click', () => {
                infoWindow.open(this.map, marker);
            });

            this.markers.push(marker);
        });

        // Show results
        this.showSearchResults(filteredBanks, bloodType);
    }

    // Show search results
    showSearchResults(banks, bloodType) {
        const resultsContainer = document.getElementById('search-results');
        if (!resultsContainer) return;

        if (banks.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <h3>No blood banks found</h3>
                    <p>No nearby blood banks have ${bloodType} available.</p>
                </div>
            `;
            return;
        }

        const resultsHtml = `
            <div class="search-results-header">
                <h3>Found ${banks.length} blood bank(s) with ${bloodType}</h3>
            </div>
            <div class="results-list">
                ${banks.map(bank => `
                    <div class="result-item">
                        <h4>${bank.name}</h4>
                        <p>${bank.address}</p>
                        <p><strong>Phone:</strong> ${bank.phone}</p>
                        <div class="result-actions">
                            <button onclick="MapsManager.getDirections(${bank.position.lat}, ${bank.position.lng})" 
                                    class="btn btn-primary btn-sm">
                                Directions
                            </button>
                            <button onclick="MapsManager.contactBloodBank('${bank.phone}')" 
                                    class="btn btn-secondary btn-sm">
                                Call
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        resultsContainer.innerHTML = resultsHtml;
    }

    // Clear all markers
    clearMarkers() {
        this.markers.forEach(marker => {
            marker.setMap(null);
        });
        this.markers = [];
    }

    // Show location error
    showLocationError() {
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div class="map-error">
                    <h3>Unable to load map</h3>
                    <p>Please check your internet connection and try again.</p>
                    <button onclick="location.reload()" class="btn btn-primary">
                        Retry
                    </button>
                </div>
            `;
        }
    }

    // Public method to initialize maps when needed
    static async initialize() {
        if (!window.mapsManager) {
            window.mapsManager = new MapsManager();
        }
        return window.mapsManager;
    }
}

// Initialize maps when Google Maps API is loaded
window.initMap = function() {
    try {
        MapsManager.initialize();
    } catch (error) {
        console.log('Google Maps not available:', error.message);
    }
};

// Export for use in other modules
window.MapsManager = MapsManager;
