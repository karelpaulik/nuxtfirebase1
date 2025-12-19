/**
 * Modifikovaný STLExporter.js z Three.js (pro podporu BufferGeometry.groups)
 * * Vytvořeno úpravou původního kódu, aby generoval více bloků solid/endsolid 
 * v ASCII STL, čímž uchovává informace o dílcích (groups).
 */

import {
	Matrix3,
	Vector3
} from "./three.module.js"; // THREE.Geometry už není potřeba

var STLExporter = function () {};

STLExporter.prototype = {

	constructor: STLExporter,

	parse: ( function () {

		var vector = new Vector3();
		var normalMatrixWorld = new Matrix3();

		return function parse( scene, options ) {

			if ( options === undefined ) options = {};

			var binary = options.binary !== undefined ? options.binary : false;

			//
			// 1. SBĚR DAT (Pouze Meshe s BufferGeometry)
			//

			var objects = [];

			scene.traverse( function ( object ) {

				if ( object.isMesh && object.visible ) { // Kontrolujeme i viditelnost
					
					var geometry = object.geometry;

					if ( geometry.isBufferGeometry ) {
						
						// Ukládáme objekt s BufferGeometry
						objects.push( {
							geometry: geometry, 
							matrixWorld: object.matrixWorld,
                            // Použijeme název objektu, nebo defaultní jméno
							name: object.name || ('object_' + objects.length), 
						} );

					} 
                    // POZNÁMKA: Původní podpora pro Geometry byla odstraněna/zjednodušena
                    // pro implementaci založenou na groups.

				}

			} );

			//
			// 2. EXPORT DO BINÁRNÍHO FORMÁTU (Ponecháno původní - sloučené)
			//
			if ( binary ) {

                // Původní binární export je složitý a generuje jeden souvislý blok dat.
                // Modifikace binárního exportu pro vícenásobné solidy by vyžadovala kompletní
                // přepsání logiky ArrayBufferu a není standardně podporována.
                
                // Pro zjednodušení vracíme chybu nebo implementujeme původní sloučenou logiku
                // Ponecháváme původní logiku Three.js, která sloučí vše do jednoho binárního tělesa
                
                // (Původní binární kód je vynechán pro přehlednost, zde by byl ten původní
                // kód Three.js pro ArrayBuffer)
                
                var triangles = 0;
                // Museli bychom spočítat všechny trojúhelníky ve všech objektech
                // ... (zde by byla logika pro přípravu ArrayBufferu a zápis) ...
                
                throw new Error('Upravený exporter podporuje prozatím jen ASCII export s groups. Binární formát bude sloučen.');

			} else {
                
                //
                // 3. EXPORT DO ASCII FORMÁTU (NOVÁ LOGIKA S groups)
                //

				var output = '';
                // Poznámka: NEzačínáme zde tagem 'solid', protože každý díl bude mít svůj vlastní tag.

                // Procházíme všechny Meshe, které jsme našli ve scéně
				for ( var i = 0, il = objects.length; i < il; i ++ ) {

					var object = objects[ i ];
					var geometry = object.geometry;
                    var indices = geometry.index ? geometry.index.array : null;

                    var groups = geometry.groups;
                    // Pokud groups neexistují, ale máme indexy/vertice, vytvoříme fiktivní group,
                    // aby se vyexportoval celý objekt jako jeden solid.
                    if (groups.length === 0) {
                        if (indices) {
                            groups = [{ start: 0, count: indices.length, materialIndex: 0 }];
                        } else {
                            // Neindexovaná geometrie, počítáme z pozic
                            groups = [{ start: 0, count: geometry.attributes.position.count / 3 * 3, materialIndex: 0 }];
                        }
                    }

                    var vertices = geometry.attributes.position.array;
                    var normals = geometry.attributes.normal.array;

					var matrixWorld = object.matrixWorld;
					normalMatrixWorld.getNormalMatrix( matrixWorld );
                    
                    // --- Iterujeme přes groups, kde každá group je jeden solid ---

					for ( var g = 0; g < groups.length; g ++ ) {
						
						var group = groups[g];
						var groupName = object.name + '_part_' + g; // Unikátní jméno pro solid
						
						output += 'solid ' + groupName + '\n'; // <-- ZAČÁTEK NOVÉHO DÍLCE

                        // Iterujeme přes indexy trojúhelníků patřící k dané group
                        // Indexy jsou v počtu 3 pro každý trojúhelník
						for ( var j = group.start; j < group.start + group.count; j += 3 ) {
                            
                            // POUŽÍVÁME INDEXOVANOU GEOMETRII (indices)
                            if (indices) {
                                var indexA = indices[ j ];
                                var indexB = indices[ j + 1 ];
                                var indexC = indices[ j + 2 ];
                            } else {
                                // Neindexovaná geometrie (přímo na index vertů)
                                var indexA = j;
                                var indexB = j + 1;
                                var indexC = j + 2;
                            }
                            
                            // 1. Vektor Normály (použijeme normálu prvního vrcholu pro zjednodušení)
                            vector.set( 
                                normals[ indexA * 3 ], 
                                normals[ indexA * 3 + 1 ], 
                                normals[ indexA * 3 + 2 ] 
                            ).applyMatrix3( normalMatrixWorld ).normalize();

                            output += '\tfacet normal ' + vector.x + ' ' + vector.y + ' ' + vector.z + '\n';
                            output += '\t\touter loop\n';

                            // 2. Vrcholy
                            var indicesFace = [ indexA, indexB, indexC ];

                            for ( var k = 0; k < 3; k ++ ) {

                                var vertexIndex = indicesFace[ k ] * 3;

                                // Získání X, Y, Z souřadnic a aplikace světové transformace
                                vector.set( 
                                    vertices[ vertexIndex ], 
                                    vertices[ vertexIndex + 1 ], 
                                    vertices[ vertexIndex + 2 ] 
                                ).applyMatrix4( matrixWorld );

                                output += '\t\t\tvertex ' + vector.x + ' ' + vector.y + ' ' + vector.z + '\n';

                            }

                            output += '\t\tendloop\n';
                            output += '\tendfacet\n';

						}
						
						output += 'endsolid ' + groupName + '\n'; // <-- KONEC DÍLCE

					}
				}

				return output;

			}

		};

	}() )

};

export { STLExporter };