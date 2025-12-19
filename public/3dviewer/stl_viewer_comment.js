var GroupA;

GroupA = new THREE.Group();
scene.add(GroupA);
//-------------------------------------------------------
var selectGroup = [];

var g1 = new THREE.Group();
scene.add(g1);
selectGroup.push(g1);
//-------------------------------------------------------


						//Umístěno v: window.addEventListener( 'keydown', function ( event ) {
						case 'Escape':
							console.log('Escape');
							transformControls.detach();
							render();
							break;

						// log scene object
						case 'o':
							console.log( 'Scene objects:' );
							console.log( scene );
							console.log( scene.children );
							break;


						case 'p':
							console.log( 'Camera pos/rot:' );
							console.log( currentCamera.position );
							console.log( currentCamera.rotation );
							break;

						// log current selected object
						case 'l':	
						console.log( 'Selected object:' );
							console.log( transformControls.object );
							break;

						case 'm':
							console.log( 'Moving objects 1 to 50 to GroupA' );
							for (let i = 1; i <= 50; i++) {
								const objectToMove = scene.children[i];

								// Kontrola pro jistotu, že pracujeme s Meshem (nebo Group), 
								// i když v předpokladu víme, že to je Mesh.
								if (objectToMove instanceof THREE.Mesh) {
									
									// Důležité: Používáme attach() pro změnu rodiče (ze scene na GroupA), 
									// PŘI ZACHOVÁNÍ SVĚTOVÉ pozice objektu.
									GroupA.attach(objectToMove);
									
								} else {
									console.warn(`Objekt na indexu ${i} nebyl Mesh a byl přeskočen.`);
								}
							}
							break;

						// attach transformControls to GroupA
						case 'n':
							console.log( 'Attaching TransformControls to GroupA' );
							console.log('GroupA', GroupA );
							transformControls.attach( GroupA );
							render();
							break;

						// create one mesh from GroupA
						case 'k':
							console.log( 'Creating one mesh from GroupA' );
							const combinedGeometry = new THREE.BufferGeometry();
							const combinedMaterials = [];
							let offset = 0;
							GroupA.children.forEach( child => {
								combinedGeometry.merge( child.geometry, offset );
								combinedMaterials.push( child.material );
								offset += child.geometry.attributes.position.count;
							} );
							const combinedMesh = new THREE.Mesh( combinedGeometry, combinedMaterials );
							GroupA.attach( combinedMesh );
							render();
							break;

						// export scene to ASCII STL
						case 'j':
							console.log( 'Exporting scene to ASCII STL' );
							exportSceneToAsciiSTL(scene);
							//exportOnlyMeshesToAsciiSTL(scene);
							break;

// STL export
//-----------------------------------------------------------------------

//Umístěno v importech							
			// Pozor - STLExporter.js jsem upravoval
			import { STLExporter } from './web3d/STLExporter.js';							
							
//-----------------------------------------------------------------------							
//Umístěno v: window.onload = function ()

			function exportSceneToAsciiSTL(scene) {
				const exporter = new STLExporter();
				
				// 1. Zpracování (Parsing) scény
				// Nastavíme binary: false, čímž vynutíme textový (ASCII) výstup.
				// const result = exporter.parse(scene, { binary: false }); 
				const result = exporter.parse(lastSelectedObject, { binary: false }); 

				// 2. Vytvoření souboru (pomocná funkce)
				saveAscii(result, 'threejs_model_ascii.stl');
			}

			function exportOnlyMeshesToAsciiSTL(scene) {
				const exporter = new STLExporter();
				
				// 1. Vytvoříme dočasnou skupinu pro export
				const meshesToExportGroup = new THREE.Group();
				
				// 2. Projdeme celou scénu a přidáme pouze Meshe do skupiny
				scene.traverse(function (object) {
					// Kontrolujeme, zda se jedná o Mesh A zda je viditelný
					if (object.isMesh && object.visible) {
						// Použijeme klon geometrie a aplikujeme globální transformaci, 
						// protože STL nemá hierarchii a potřebuje absolutní souřadnice.
						const meshClone = object.clone();
						
						// DŮLEŽITÉ: Přidáváme klon do skupiny, ne původní objekt!
						meshesToExportGroup.add(meshClone); 
					}
					// Poznámka: Ostatní objekty (Light, Camera, Group) přeskočíme
				});
				
				// 3. Zpracování (Parsing) POUZE dočasné skupiny
				// Všechna geometrie v meshesToExportGroup bude sloučena do jednoho souboru.
				const result = exporter.parse(meshesToExportGroup, { binary: false }); 

				// 4. Vytvoření souboru
				saveAscii(result, 'threejs_meshes_only_ascii.stl');
				
				// 5. Uklidíme dočasnou skupinu
				meshesToExportGroup.clear();
			}

			// --- Pomocná funkce pro stažení textového souboru ---
			function saveAscii(textData, filename) {
				// Vytvoříme Blob přímo z textových dat
				const blob = new Blob([textData], { type: 'text/plain' });
				
				// Vytvoříme odkaz pro stažení
				const link = document.createElement('a');
				link.style.display = 'none';
				document.body.appendChild(link);
				
				link.href = URL.createObjectURL(blob);
				link.download = filename;
				link.click();
				
				// Uklidíme
				document.body.removeChild(link);
			}
			
// ----------------------------------------------------------
event.keyCode
event.key

function onClick( event ) {
	if (!event.ctrlKey) {	// Pokud nedržím ctrl



scene.add( transformControls );	
transformControls.attach(selectedObjects[0]);
transformControls.detach();

scene.remove( object );