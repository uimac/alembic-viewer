/*jslint devel:true*/
/*global Float32Array */
(function (ummath) {

	function load(obj) {
		var i,
			k,
			n,
			v0, v1, v2,
			vals,
			line,
			lines,
			indices,
			vertices = [],
			normals = [],
			uvs = [],
			face,
			mesh_verts = [],
			mesh_normals = [],
			mesh_uvs = [],
			triangle_fan = [];

		lines = obj.split("\n");
		for (i = 0; i < lines.length; i = i + 1) {
			line = lines[i];
			vals = line.split(/\s+/).filter(Boolean);
			if (vals[0] === "v") {
				vertices.push([Number(vals[1]), Number(vals[2]), Number(vals[3])]);
			} else if (vals[0] === "vn") {
				normals.push([Number(vals[1]), Number(vals[2]), Number(vals[3])]);
			} else if (vals[0] === "vt") {
				uvs.push([Number(vals[1]), Number(vals[2])]);
			} else if (vals[0] === "f") {
				face = {
					vindex: [],
					nindex : [],
					uvindex : []
				};
				for (k = 1; k < vals.length; k = k + 1) {
					var initialSplitIndex = vals[k].indexOf('//'),
						indices = vals[k].split(/[\s/]+/).filter(Boolean);
					if (initialSplitIndex > 0) {
						if (Number(indices[0]) < 0) {
							face.vindex.push(vertices.length + Number(indices[0]));
						} else {
							face.vindex.push(indices[0] - 1);
						}
						if (Number(indices[1]) < 0) {
							face.nindex.push(normals.length + Number(indices[1]));
						} else {
							face.nindex.push(indices[1] - 1);
						}
					} else if (indices.length > 0) {
						if (Number(indices[0]) < 0) {
							face.vindex.push(vertices.length + Number(indices[0]));
						} else {
							face.vindex.push(Number(indices[0]) - 1);
						}
						if (indices.length > 1) {
							if (Number(indices[1]) < 0) {
								face.uvindex.push(uvs.length + Number(indices[1]));
							} else {
								face.uvindex.push(Number(indices[1]) - 1);
							}
							if (indices.length > 2) {
								if (Number(indices[2]) < 0) {
									face.nindex.push(normals.length + Number(indices[2]));
								} else {
									face.nindex.push(Number(indices[2]) - 1);
								}
							}
						}
					} else {
						alert("invalid obj")
						return null;
					}
				}
				// flatten
				if (vals.length >= 4) {
					// 三角形
					for (k = 0; k < 3; k = k + 1) {
						if (face.vindex.length > 0) {
							Array.prototype.push.apply(mesh_verts, vertices[face.vindex[k]]);
						}
						if (normals.length <= 0) {
							//calculate_normals
						} else if (face.nindex.length > 0) {
							Array.prototype.push.apply(mesh_normals, normals[face.nindex[k]]);
						} else {
							Array.prototype.push.apply(mesh_normals, normals[face.vindex[k]]);
						}
						if (face.uvindex.length > 0) {
							Array.prototype.push.apply(mesh_uvs, uvs[face.uvindex[k]]);
						} else {
							Array.prototype.push.apply(mesh_uvs, uvs[face.vindex[k]]);
						}
					}
					if (normals.length <= 0) {
						v0 = new ummath.UMVec3d(vertices[face.vindex[0]]);
						v1 = new ummath.UMVec3d(vertices[face.vindex[1]]);
						v2 = new ummath.UMVec3d(vertices[face.vindex[2]]);
						n = v0.sub(v1).cross( v2.sub(v1) ).normalized();
						if (n.xyz[0] === 0 && n.xyz[1] === 0 && n.xyz[2] === 0) {
							n = v0.sub(v1).scale(10000).cross( v2.sub(v1).scale(10000) ).normalized();
						}
						Array.prototype.push.apply(mesh_normals, n.xyz);
						Array.prototype.push.apply(mesh_normals, n.xyz);
						Array.prototype.push.apply(mesh_normals, n.xyz);
					}
					if (uvs.length <= 0) {
						Array.prototype.push.apply(mesh_uvs, [0, 0]);
						Array.prototype.push.apply(mesh_uvs, [0, 0]);
						Array.prototype.push.apply(mesh_uvs, [0, 0]);
					}
					for (k = 3; k < vals.length-1; k = k + 1) {
						triangle_fan = [0, k-1, k];
						for (n = 0; n < triangle_fan.length; n = n + 1) {
							if (face.vindex.length > 0) {
								Array.prototype.push.apply(mesh_verts, vertices[face.vindex[triangle_fan[n]]]);
							}
							if (normals.length <= 0) {
								//calculate_normals
							} else if (face.nindex.length > 0) {
								Array.prototype.push.apply(mesh_normals, normals[face.nindex[triangle_fan[n]]]);
							} else {
								Array.prototype.push.apply(mesh_normals, normals[face.vindex[triangle_fan[n]]]);
							}
							if (face.uvindex.length > 0) {
								Array.prototype.push.apply(mesh_uvs, uvs[face.uvindex[triangle_fan[n]]]);
							} else {
								Array.prototype.push.apply(mesh_uvs, uvs[face.vindex[triangle_fan[n]]]);
							}
						}
						if (normals.length <= 0) {
							v0 = new ummath.UMVec3d(vertices[face.vindex[triangle_fan[0]]]);
							v1 = new ummath.UMVec3d(vertices[face.vindex[triangle_fan[1]]]);
							v2 = new ummath.UMVec3d(vertices[face.vindex[triangle_fan[2]]]);
							n = v0.sub(v1).cross( v2.sub(v1) ).normalized();
							if (n.xyz[0] === 0 && n.xyz[1] === 0 && n.xyz[2] === 0) {
								n = v0.sub(v1).scale(10000).cross( v2.sub(v1).scale(10000) ).normalized();
							}
							Array.prototype.push.apply(mesh_normals, n.xyz);
							Array.prototype.push.apply(mesh_normals, n.xyz);
							Array.prototype.push.apply(mesh_normals, n.xyz);
						}
						if (uvs.length <= 0) {
							Array.prototype.push.apply(mesh_uvs, [0, 0]);
							Array.prototype.push.apply(mesh_uvs, [0, 0]);
							Array.prototype.push.apply(mesh_uvs, [0, 0]);
						}
					}
				}
			}
		}

		//console.log(mesh_verts, mesh_normals, mesh_uvs);
		return { vertices : mesh_verts, normals : mesh_normals, uvs : mesh_uvs };
	}

	window.umobj = {};
	window.umobj.load = load;

}(window.ummath));
