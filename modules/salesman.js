/**
 * @author Guy Luong
 */

import * as THREE from 'three';

let __SETTINGS__ = {
	pointsCount: 30,
	populationMax: 500,
	mutationFrequency: 0.15,
	crossFrequency: 0.30,
	generations: 60,
	frameDelay: 500,
	weights: [0.40, 0.30, 0.17, 0.08, 0.05],
	lightColor: 0xffffff,
	pointColor: 0xffffff,
	distanceScale: 60
};

class TSPEnvironment {
	/**
	 * Bundle class for a complete environment for
	 * the Travelling Salesman Problem.
	 */
	constructor() {
		/** @type {THREE.Vector3} */
		this.start = randomPoint();

		this.init();
	}

	init() {
		/** @type {THREE.Vector3[]} */
		this.points = []; // Avoids duplicates in later generations

		for (let i = 0; i < __SETTINGS__.pointsCount; i++) {
			this.points[i] = randomPoint();
		}
	}
}

/**
 * Represents a Path in the Travelling Salesman Problem.
 * 
 * Ex: [5, 6, 1, 2,...] is the path beginning by the 5th point, then going
 * to the 6th, then the first and so on.
 */
class Path {
	/**
	 *
	 * @param {number[]} pointIndex ordered point index
	 * @param {TSPEnvironment} env
	 */
	constructor(pointIndex, env) {
		/** @type {number[]} */
		this.pointIndex = pointIndex;

		/** @type {TSPEnvironment} */
		this.env = env;

		/** @type {number} */
		this.score = this.computeScore();
	}

	/**
	 * @returns {number} the length of the path
	 */
	length() {
		let total = 0.0;

		for (let i = 0; i < this.pointIndex.length - 1; i++) {
			total += this.env.points[this.pointIndex[i]].distanceTo(this.env.points[this.pointIndex[i + 1]]);
		}

		// add start and end distance parts of the path, connecting with the starting position
		total += this.env.start.distanceTo(this.env.points[this.pointIndex[0]]);
		total += this.env.start.distanceTo(this.env.points[this.pointIndex[this.pointIndex.length - 1]]);

		return total;
	}

	isValid() {
		return (new Set(this.pointIndex)).size === this.pointIndex.length;
	}

	computeScore() {
		if (!this.isValid()) {
			return 999999999;
		}
		return this.length();
	}

	/**
	 * A function directly usable by `Array.prototype.sort()`.
	 * @param {Path} other 
	 * @returns an number being:
	 * - a negative if this path is shorter
	 * - 0 if they are equal in score
	 * - a positive if the other path is shorter
	 */
	isShorterThan(other) {
		return this.length() - other.length();
	}

	/**
	 * A function directly usable by `Array.prototype.sort()`.
	 * @param {Path} other 
	 * @returns an number being:
	 * - a negative if this path is better
	 * - 0 if they are equal in score
	 * - a positive if the other path is better
	 */
	isBetterThan(other) {
		return this.score - other.score;
	}

	/**
	 * Provides a mutated copy of this path. 
	 * @param {number} count the number of mutations
	 * @return another path resulting from a mutation of this one.
	 */
	mutate(count = 1) {
		let newPath = this.pointIndex.slice();

		for (let i = 0; i < count; ++i) {
			let pickA = Math.floor(Math.random() * (newPath.length));
			let pickB = Math.floor(Math.random() * (newPath.length));
			[newPath[pickA], newPath[pickB]] = [newPath[pickB], newPath[pickA]];
		}

		return new Path(newPath, this.env);
	}

	/**
	 * Provides an offspring from a crossover between two Paths.
	 * @param {Path} other 
	 * @param {number} slices number of slices
	 * @todo slices are defaulted to 1 (and not yet used)
	 * @return a Path with parts from this path and the other given in argument
	 */
	breed(other, slices = 1) {
		let offspring = [];

		let pick = Math.floor(Math.random() * this.pointIndex.length);

		// Fill the first part with this path
		offspring.push(...this.pointIndex.slice(0, pick));

		// Fill the rest with the other parent
		let rest = other.pointIndex;
		let currentParent2Index = 0;

		for (let i = pick; i < this.pointIndex.length; i++) {
			while (offspring.includes(rest[currentParent2Index]) && currentParent2Index < this.pointIndex.length) {
				currentParent2Index++;
			}
			offspring.push(rest[currentParent2Index]);
		}


		return new Path(offspring, this.env);
	}
}

/**
 * 
 * @param {Array} array 
 * @returns 
 */
function shuffleArray(array) {
	// Create a copy of the original array to avoid modifying the input array
	const newArray = array.slice();

	// Fisher-Yates shuffle algorithm
	for (let i = newArray.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		// Swap elements at i and j
		[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
	}

	return newArray;
}

/** 
 * @param {int} size 
 * @returns an array initialized with [0, 1, 2, 3, ..., size - 1]
 */
function initArray(size) {
	if (size < 1) {
		throw new Error('initArray: size must be positive');
	}

	// trick explained here
	// https://tobias-ljungstrom.medium.com/how-to-quickly-create-an-array-of-sequential-numbers-in-javascript-and-how-it-works-686663f06d5
	return [...Array(size).keys()];
}

/**
 * 
 * @returns {THREE.Vector3} a point with x, y, z between -0.5 and 5
 */
function randomPoint() {
	return new THREE.Vector3(
		Math.random() - 0.5,
		Math.random() - 0.5,
		Math.random() - 0.5
	).multiplyScalar(__SETTINGS__.distanceScale);
}

/**
 * @param {number[]} weights an array of (5) weights that sum to 1
 * @param {number} excludeIndex an index we don't want to end up on
 * @returns an index selected with a weight
 * If the supposed returned value is excludeIndex, the current implementation
 * returns a neighboring valid index.
 */
function roll(weights, excludeIndex = -1) {
	let n = Math.random();
	let sum = 0;

	for (let i = 0; i < weights; i++) {
		if (sum + weights[i] > n) {
			let pointsInWeightCut = Math.ceil(__SETTINGS__.populationMax / weights.length);
			let j = i * pointsInWeightCut
				+ Math.floor(((n - sum) * 100 / weights[i]) * pointsInWeightCut);

			if (j != excludeIndex) {
				return j;
			} else {
				if (j + 1 > __SETTINGS__.populationMax)
					return j - 1;
				return j + 1;
			}
		}
		sum += weights[i];
	}

	// It shouldn't be here normally, but we need to return properly something
	// Here's an uniform roll.
	return Math.floor(Math.random() * __SETTINGS__.populationMax);
}

class TSP {
	constructor() {
		this.settings = __SETTINGS__;

		/** @type {TSPEnvironment} */
		this.environment = new TSPEnvironment();

		/** @type {THREE.Vector3} */
		this.startPosition = randomPoint();

		/** @type {THREE.Object3D} */
		this.anchor = new THREE.Object3D();

		/** @type {THREE.Object3D} */
		this.lights = new THREE.Object3D();

		/** @type {boolean} */
		this.stopFlag = false;

		if (__SETTINGS__.pointsCount < 1) {
			throw new RangeError('Path.generate: Cannot generate 0 points or less. Number given: ' + __SETTINGS__.pointsCount);
		}

		this.setup();
	}

	setup() {
		this.lights.children = [];

		const simpleSphere = new THREE.SphereGeometry(0.5, 8, 8);

		const createCity = (position, _color = 0xffffff) => {
			let pointLight = new THREE.PointLight(__SETTINGS__.lightColor, 100);
			pointLight.add(
				new THREE.Mesh(
					simpleSphere,
					new THREE.MeshBasicMaterial({ color: _color })
				));
			pointLight.position.copy(position);
			this.lights.add(pointLight);
		};

		for (let i = 0; i < this.environment.points.length; i++) {
			createCity(this.environment.points[i], __SETTINGS__.pointColor);
		}
		createCity(this.environment.start, 0xff0000);
	}

	reset() {
		this.environment.init();
		this.setup();
		this.generate();
	}

	stop() {
		this.stopFlag = true;
	}

	/**
	 * Returns a (hopefully) good solution to the Travelling Salesman problem
	 * using genetic algorithms.
	 * @todo Currently a blocking call function
	 * @return {Path}
	 */
	async generate(generations = 100) {
		if (this.stopFlag) {
			this.stopFlag = false;
		}

		// Population init
		let population = [];
		let array = initArray(__SETTINGS__.pointsCount);

		for (let i = 0; i < __SETTINGS__.populationMax; i++) {
			population[i] = new Path(shuffleArray(array), this.environment); // generate path
		}

		/**
		 * 
		 * @param {number} generations number of generations to do
		 * @returns {Path}
		 */
		const step = async (generations) => {
			if (this.stopFlag) {
				console.log('Stopping...');
				return;
			}

			// Ascending order, with paths with lower (better) scores first.
			population.sort((a, b) => a.isBetterThan(b));

			if (generations == 0)
				return population[0];

			// Trim excess population
			population = population.slice(0, __SETTINGS__.populationMax);

			// Render best path
			this.render(population[0].pointIndex); // TODO

			// Parent selection
			const numberCrossovers = __SETTINGS__.crossFrequency * population.length;
			for (let j = 0; j < numberCrossovers; j++) {
				// Rolls are always between parents since the starting population size is a constant here.
				let parentA = roll(__SETTINGS__.weights);
				let parentB = roll(__SETTINGS__.weights, parentA);

				population.push(population[parentA].breed(population[parentB]));
				population.push(population[parentB].breed(population[parentA]));
			}

			// Mutation
			const numberMutations = __SETTINGS__.mutationFrequency * population.length;
			const populationSizeBeforeMutations = population.length;
			for (let j = 0; j < numberMutations; j++) {
				let mutatedPath = population[Math.floor(Math.random() * populationSizeBeforeMutations)].mutate();
				population.push(mutatedPath);
			}

			setTimeout(() => step(generations - 1), __SETTINGS__.frameDelay);
		};

		await step(generations);

		return population[0];
	}

	/**
	 * Creates the objects 
	 * @param {number[]} orderedIndex 
	 */
	render(orderedIndex) {
		this.anchor.children = [];

		this.anchor.add(this.lights);

		const points = [this.environment.start];

		for (let i = 0; i < orderedIndex.length; i++) {
			points.push(this.environment.points[orderedIndex[i]]);
		}

		points.push(this.environment.start);

		const geometry = new THREE.BufferGeometry().setFromPoints(points);
		const material = new THREE.LineDashedMaterial({ color: 0xffffff });
		const line = new THREE.Line(geometry, material);
		this.anchor.add(line);
	}
}

export default TSP;