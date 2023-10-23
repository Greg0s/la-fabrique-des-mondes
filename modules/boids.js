import * as THREE from 'three';
import tools from './tools';

const settings = {
	BOID_COUNT: 20,
	WORLD_SCALE: 5,

	VISUAL_RANGE: 0.5,
	SEPARATION_MIN_DISTANCE: 0.3,

	SPEED_LIMIT: 0.1,

	COHESION_FACTOR: 0.2,
	SEPARATION_FACTOR: 0.5,
	ALIGNMENT_FACTOR: 0.2,

	WALL_MARGIN: 0.05,
	WALL_TURN_FACTOR: 0.1
};

const behaviors = {
	/**
	 * 
	 * @param {Boid} boid 
	 * @param {BoidEnvironment} environment 
	 * @return {THREE.Vector3} an influence vector
	 */
	cohesion: (boid, environment) => {
		let neighbours = 0;
		let center = new THREE.Vector3(); // center of mass

		environment.boids
			.filter((other) => other !== boid)
			.forEach(other => {
				if (boid.isNear(other)) {
					++neighbours;
					center.add(other.position);
				}
			});

		if (neighbours > 0) {
			center.divideScalar(neighbours);
			boid.movement.add((center.sub(boid.position).multiplyScalar(settings.COHESION_FACTOR)));
		}
	},

	separation: (boid, environment) => {
		let movement = new THREE.Vector3();

		environment.boids
			.filter((other) => other !== boid)
			.forEach(other => {
				if (boid.isNear(other, settings.SEPARATION_MIN_DISTANCE)) {
					movement.add(boid.position.clone().sub(other.position));
				}
			});

		boid.movement.add(movement.multiplyScalar(settings.SEPARATION_FACTOR));
	},

	alignment: (boid, environment) => {
		let neighbours = 0;
		let alignmentVector = new THREE.Vector3();

		environment.boids
			.filter((other) => other !== boid)
			.forEach(other => {
				if (boid.isNear(other)) {
					++neighbours;
					alignmentVector.add(other.movement);
				}
			});

		if (neighbours > 0) {
			alignmentVector.divideScalar(neighbours);
			boid.movement.add(alignmentVector.multiplyScalar(settings.ALIGNMENT_FACTOR));
		}
	},

	// eslint-disable-next-line no-unused-vars
	speedLimiter: (boid, _) => {
		let speed = boid.movement.length();

		if (speed > settings.SPEED_LIMIT) {
			boid.movement.multiplyScalar(settings.SPEED_LIMIT / speed);
		}
	},

	// eslint-disable-next-line no-unused-vars
	stayInBounds: (boid, _) => {
		if (boid.position.x < -settings.WORLD_SCALE + settings.WALL_MARGIN) {
			boid.movement.x += settings.WALL_TURN_FACTOR;
		}
		if (boid.position.x > settings.WORLD_SCALE - settings.WALL_MARGIN) {
			boid.movement.x -= settings.WALL_TURN_FACTOR;
		}
		if (boid.position.y < -settings.WORLD_SCALE + settings.WALL_MARGIN) {
			boid.movement.y += settings.WALL_TURN_FACTOR;
		}
		if (boid.position.y > settings.WORLD_SCALE - settings.WALL_MARGIN) {
			boid.movement.y -= settings.WALL_TURN_FACTOR;
		}
		if (boid.position.z < -settings.WORLD_SCALE + settings.WALL_MARGIN) {
			boid.movement.z += settings.WALL_TURN_FACTOR;
		}
		if (boid.position.z > settings.WORLD_SCALE - settings.WALL_MARGIN) {
			boid.movement.z -= settings.WALL_TURN_FACTOR;
		}
	}
};

class Boid {
	/**
	 * 
	 * @param {THREE.Vector3} position
	 * @param {THREE.Mesh} mesh
	 */
	constructor(position, mesh) {
		this.position = position;

		/** @type {THREE.Vector3} */
		this.movement = tools.randomPoint();

		/** @type {THREE.Mesh} */
		this.mesh = mesh.clone();

		this.behaviors = [
			behaviors.stayInBounds,
			behaviors.alignment,
			behaviors.cohesion,
			behaviors.separation,
			behaviors.speedLimiter
		];
	}

	/**
	 * 
	 * @param {Boid} other
	 * @return {boolean} whether this fish is close to the other 
	 */
	isNear(other, threshold = settings.VISUAL_RANGE) {
		return this.position.distanceTo(other.position) < threshold;
	}

	/**
	 * 
	 * @param {BoidEnvironment} environment 
	 */
	update(environment) {
		this.behaviors.forEach((behavior) => behavior(this, environment));
		this.position.add(this.movement);
	}

	render() {
		let mx = new THREE.Matrix4().lookAt(this.position, this.movement, new THREE.Vector3(0, 0, 1));
		let qt = new THREE.Quaternion().setFromRotationMatrix(mx);

		this.mesh.quaternion.copy(qt);

		this.mesh.position.copy(this.position);
	}
}

class BoidEnvironment {
	constructor() {
		/** @type {Boid[]} */
		this.boids = [];

		/** @type {*} */
		this.obstacles = [];

		/**
		 * @type {THREE.Object3D}
		 * @todo link mesh to this anchor or something
		 */
		this.anchor = new THREE.Object3D();
	}

	create() {
		let geometry = new THREE.ConeGeometry(0.1, 0.2, 8, 8);
		let material = new THREE.MeshBasicMaterial({ color: 0xaaaa00 });

		this.boids = [];

		// TODO add boids in anchor
		// TODO manage their movement (actual boid & cone displayed)
		for (let i = 0; i < settings.BOID_COUNT; ++i) {
			let boid = new Boid(tools.randomPoint(), new THREE.Mesh(geometry, material));
			this.boids.push(boid);
			this.anchor.add(boid.mesh);
		}

		console.log('Created ' + settings.BOID_COUNT + ' boids.');
	}

	update() {
		this.boids.forEach(boid => boid.update(this));
	}

	render() {
		this.boids.forEach(boid => boid.render());
	}
}

export default BoidEnvironment;