import { useRef, useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';

import apiFetch from '@wordpress/api-fetch';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const Map = (props) => {
	const {
		mapboxToken = '',
		mapboxStyle = '',
		mapboxLongitude = 0,
		mapboxLatitude = 0,
		mapboxZoom = 0,
		mapboxPitch = 0,
		mapboxBearing = 0,
		mapboxHideControls = false,
		updateCallback = () => {},
	} = props;

	const mapContainer = useRef(null);
	const map = useRef(null);
	const [mapReady, setMapReady] = useState(false);
	const [posts, setPosts] = useState([]);

	useEffect(() => {
		apiFetch({ path: '/wp-json/wp/v2/person' }).then((response) => {
			console.log(response);
			setPosts(response);
		});
	}, []);

	useEffect(() => {
		if (map.current || !mapboxToken) return;

		if (mapboxLongitude === 0 && mapboxLatitude === 0) {
			return;
		}

		mapboxgl.accessToken = mapboxToken;

		map.current = new mapboxgl.Map({
			container: mapContainer.current,
			style: mapboxStyle,
			center: [mapboxLongitude, mapboxLatitude],
			zoom: mapboxZoom,
			pitch: mapboxPitch,
			bearing: mapboxBearing,
		});

		map.current.on('moveend', () => {
			const { lng: longitude, lat: latitude } = map.current.getCenter();
			const zoom = map.current.getZoom();
			const pitch = map.current.getPitch();
			const bearing = map.current.getBearing();

			updateCallback({ longitude, latitude, zoom, pitch, bearing });
		});

		map.current.on('load', function() {
			map.current.addLayer(
			  	{
					id: 'country-boundaries',
					source: {
						type: 'vector',
						url: 'mapbox://mapbox.country-boundaries-v1',
					},
					'source-layer': 'country_boundaries',
					type: 'fill',
					paint: {
						'fill-color': '#d2361e',
						'fill-opacity': 0.4,
					},
			  	},
			  'country-label'
			);

			map.current.setFilter('country-boundaries', [
				"in",
				"iso_3166_1_alpha_3",
				'NLD',
				'ITA'
			]);
		});

		map.current.on('click', function(e) {
			const features = map.current.queryRenderedFeatures(e.point, { layers: ['country-boundaries'] });
		
			if (features.length > 0) {
				const clickedCountry = features[0].properties.name;
				console.log(clickedCountry, features[0].properties);
			}
		});

		setMapReady(true);
	}, [
		map,
		mapboxBearing,
		mapboxLatitude,
		mapboxLongitude,
		mapboxPitch,
		mapboxStyle,
		mapboxToken,
		mapboxZoom,
		updateCallback,
	]);

	useEffect(() => {
		if (!mapReady) return;

		map.current.setCenter(
			new mapboxgl.LngLat(mapboxLongitude, mapboxLatitude)
		);
	}, [mapboxLongitude, mapboxLatitude, mapReady]);

	useEffect(() => {
		if (!mapReady) return;

		map.current.setZoom(mapboxZoom);
	}, [mapboxZoom, mapReady]);

	useEffect(() => {
		if (!mapReady) return;

		map.current.setPitch(mapboxPitch);
	}, [mapboxPitch, mapReady]);

	useEffect(() => {
		if (!mapReady) return;

		map.current.setBearing(mapboxBearing);
	}, [mapboxBearing, mapReady]);

	useEffect(() => {
		if (!mapReady) return;

		map.current.setStyle(mapboxStyle);
	}, [mapboxStyle, mapReady]);

	useEffect(() => {
		if (!mapReady) return;

		if (!mapboxHideControls) {
			const navControl = new mapboxgl.NavigationControl();
			const fullscreenControl = new mapboxgl.FullscreenControl();

			map.current.addControl(navControl);
			map.current.addControl(fullscreenControl);

			return () => {
				map.current.removeControl(navControl);
				map.current.removeControl(fullscreenControl);
			};
		}
	}, [mapboxHideControls, mapReady]);

	if (!mapboxToken) {
		return (
			<div>
				<p>{__('Mapbox not configured.', 'mapbox-for-wp')}</p>
			</div>
		);
	}

	return (
		<div>
			<div className="map-container" style={{ height: '500px' }}>
				<div
					ref={mapContainer}
					style={{ width: '100%', height: '100%' }}
				/>
			</div>
		</div>
	);
};

export default Map;
