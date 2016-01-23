/*jslint devel:true*/
/*global Float32Array, Uint8Array */
(function (ummath, umline, ummesh, ummaterial, umcamera, umshader, umobj) {
	"use strict";
	var UMScene,
		now = window.performance && (
	    performance.now ||
	    performance.mozNow ||
	    performance.msNow ||
	    performance.oNow ||
	    performance.webkitNow );

	UMScene = function (gl) {
		this.gl = gl;
		this.camera = null;
		this.shader_list = [];
		this.shader = null;
		this.grid = null;
		this.test_mesh = null;
		this.mesh_list = [];
		this.point_list = [];
		this.update_func_list = [];
		this.width = 800;
		this.height = 600;
		this.current_time = 0;
		this.is_playing = false;
		this.is_pausing = false;
		this.is_cw = false;
	};

	function load_texture(gl, source, endcallback) {
		var img = document.getElementById('pngimage');
		img.onload = function () {
			var tex = gl.createTexture();
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, tex);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
			//gl.generateMipmap(gl.TEXTURE_2D);
			gl.bindTexture(gl.TEXTURE_2D, null);
			endcallback(tex, img);
		};
		img.src = source;
	}

	function read_frame(gl, texture) {
		var fb = gl.createFramebuffer(),
			pixels = new Uint8Array(1024 * 1024 * 4);

		gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
		gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
		gl.readPixels(0, 0, 1024, 1024, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		return pixels;
	}

	function create_test_mesh(gl) {
		var mesh,
			verts = [
				0, 0, 0,
				10, 0, 0,
				10, 10, 0,
				0, 0, 0,
				10, 10, 0,
				0, 10, 0
			],
			normals = [
				0, 0, 1,
				0, 0, 1,
				0, 0, 1,
				0, 0, 1,
				0, 0, 1,
				0, 0, 1
			],
			uvs = [
				0, 1,
				1, 1,
				1, 0,
				0, 1,
				1, 0,
				0, 0
			],
			mesh_mat;
		mesh = new ummesh.UMMesh(gl, verts, normals, uvs);
		mesh_mat = new ummaterial.UMMaterial(gl);
		mesh_mat.set_polygon_count(2);
		mesh.material_list.push(mesh_mat);
		return mesh;
	}

	function create_grid(gl) {
		var line_list = [],
			i,
			k,
			quarter = 10,
			offset,
			line1,
			line2,
			line_size = 25.0,
			delta = line_size / quarter,
			line,
			linemat,
			linemat_x,
			linemat_y,
			linemat_z;

		for (i = 0; i < 4; i = i + 1) {
			if (i === 1) {
				offset = new ummath.UMVec3d(-line_size, 0, 0);
			} else if (i === 2) {
				offset = new ummath.UMVec3d(-line_size, 0, -line_size);
			} else if (i === 3) {
				offset = new ummath.UMVec3d(0, 0, -line_size);
			} else {
				offset = new ummath.UMVec3d(0, 0, 0);
			}
			for (k = 0; k <= quarter; k = k + 1) {
				line1 = [new ummath.UMVec3d(k * delta, 0, 0), new ummath.UMVec3d(k * delta, 0, line_size)];
				line2 = [new ummath.UMVec3d(0, 0, k * delta), new ummath.UMVec3d(line_size, 0, k * delta)];
				line1[0] = line1[0].add(offset);
				line1[1] = line1[1].add(offset);
				line2[0] = line2[0].add(offset);
				line2[1] = line2[1].add(offset);
				line_list = line_list.concat(line1[0].xyz);
				line_list = line_list.concat(line1[1].xyz);
				line_list = line_list.concat(line2[0].xyz);
				line_list = line_list.concat(line2[1].xyz);
			}
		}
		line = new umline.UMLine(gl, line_list);
		linemat_z = new ummaterial.UMMaterial(gl);
		linemat_z.set_polygon_count(1);
		linemat_z.set_constant_color(new ummath.UMVec4d(0.3, 0.3, 0.9, 1.0));
		line.material_list.push(linemat_z);
		linemat_x = new ummaterial.UMMaterial(gl);
		linemat_x.set_polygon_count(1);
		linemat_x.set_constant_color(new ummath.UMVec4d(0.9, 0.3, 0.3, 1.0));
		line.material_list.push(linemat_x);
		linemat = new ummaterial.UMMaterial(gl);
		linemat.set_polygon_count(line_list.length / 3 / 2 - 2);
		linemat.set_constant_color(new ummath.UMVec4d(1.0, 1.0, 1.0, 1.0));
		line.material_list.push(linemat);
		return line;
	}

	function get_time() {
		return ( now && now.call( performance ) ) || ( new Date().get_time() );
	}

	UMScene.prototype.play = function () {
		if (this.is_pausing) {
			this.is_pausing = false;
		} else {
			this.current_time = 0;
		}
		this.last_time = get_time();
		this.is_playing = true;
	};

	UMScene.prototype.stop = function () {
		var i;
		this.current_time = 0;
		this.is_playing = false;
		for (i = 0; i < this.update_func_list.length; i = i + 1) {
			this.update_func_list[i]();
		}
	};

	UMScene.prototype.pause = function () {
		this.is_pausing = true;
		this.is_playing = false;
	};

	UMScene.prototype.clear = function () {
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	};

	UMScene.prototype.update = function () {
		var i,
			time,
			step;

		this.camera.update();
		if (this.is_playing) {
			time = get_time();
			step = time - this.last_time;
			this.current_time = this.current_time + step;
			for (i = 0; i < this.update_func_list.length; i = i + 1) {
				this.update_func_list[i]();
			}
			this.last_time = time;
			console.log(this.current_time);
		}
	};

	UMScene.prototype.draw = function () {
		var i,
			gl = this.gl;

		if (this.test_mesh) {
			this.test_mesh.draw(this.current_shader, this.camera);
		}
		for (i = 0; i < this.mesh_list.length; i = i + 1) {
			if (this.is_cw !== this.mesh_list[i].is_cw) {
				this.is_cw = this.mesh_list[i].is_cw;
				if (this.is_cw) {
					gl.frontFace(gl.CW);
				} else {
					gl.frontFace(gl.CCW);
				}
			}
			this.mesh_list[i].draw(this.current_shader, this.camera);
		}
		for (i = 0; i < this.point_list.length; i = i + 1) {
			this.point_list[i].draw(this.shader_list[0], this.camera);
		}
		this.grid.draw(this.shader_list[0], this.camera);
	};

	UMScene.prototype.init = function () {
		var gl = this.gl,
			initial_shader,
			shader;
		this.camera = new umcamera.UMCamera(gl, this.width, this.height);
		initial_shader = new umshader.UMShader(gl);
		initial_shader.create_shader_from_id('vertex_shader', 'fragment_shader');
		this.shader_list.push(initial_shader);
		this.current_shader = initial_shader;

		shader = new umshader.UMShader(gl);
		shader.create_shader_from_id('edge_vertex_shader', 'edge_fragment_shader');
		this.shader_list.push(shader);

		this.grid = create_grid(gl);
	};

	UMScene.prototype.change_shader = function (shader_number) {
		var i;
		for (i = 0; i < this.mesh_list.length; i = i + 1) {
			this.mesh_list[i].reset_shader_location();
		}
		this.camera.reset_shader_location();
		this.current_shader = this.shader_list[shader_number];
	};

	UMScene.prototype.resize = function (width, height) {
		this.width = width;
		this.height = height;
		this.camera.resize(width, height);
	};

	UMScene.prototype.load_obj = function (text) {
		var obj = umobj.load(text),
			mesh = new ummesh.UMMesh(this.gl, obj.vertices, obj.normals, obj.uvs),
			meshmat;

		meshmat = new ummaterial.UMMaterial(this.gl);
		meshmat.set_polygon_count(obj.vertices.length / 3 / 3);
		mesh.material_list.push(meshmat);
		this.mesh_list.push(mesh);
	};

	UMScene.prototype._load_abc_mesh = function (abcio, abcpath) {
		var abcmesh,
			i,
			n,
			m,
			mesh,
			path_list,
			material;
		path_list = abcio.get_mesh_path_list(abcpath);
		console.log(path_list);
		for (i = 0; i < path_list.length; i = i + 1) {
			abcmesh = abcio.get_mesh(abcpath, path_list[i]);
			console.log(abcmesh);
			if (abcmesh && abcmesh.hasOwnProperty("vertex")) {
				console.log(abcmesh);
				mesh = new ummesh.UMMesh(this.gl, abcmesh.vertex, abcmesh.normal, abcmesh.uv, abcmesh.index);
				mesh.is_cw = true;
				console.log(abcmesh.global_transform);
				for (n = 0; n < 4; n = n + 1) {
					for (m = 0; m < 4; m = m + 1) {
						mesh.global_matrix.m[n][m] = abcmesh.global_transform[n * 4 + m];
					}
				}
				material = new ummaterial.UMMaterial(this.gl);
				if (abcmesh.index.length > 0) {
					material.set_polygon_count(abcmesh.index.length / 3);
				} else {
					material.set_polygon_count(abcmesh.vertex.length / 3 / 3);
				}
				mesh.material_list.push(material);
				this.mesh_list.push(mesh);
			}
		}
	}

	UMScene.prototype._update_abc_mesh = function (abcio, abcpath) {
		var abcmesh,
			i,
			n,
			m,
			mesh,
			path_list,
			material;
		path_list = abcio.get_mesh_path_list(abcpath);

		for (i = 0; i < path_list.length; i = i + 1) {
			abcmesh = abcio.get_mesh(abcpath, path_list[i]);
			mesh = this.mesh_list[i];
			if (abcmesh && abcmesh.hasOwnProperty("vertex")) {
				mesh.update(abcmesh.vertex, abcmesh.normal, abcmesh.uv, abcmesh.index);
				for (n = 0; n < 4; n = n + 1) {
					for (m = 0; m < 4; m = m + 1) {
						mesh.global_matrix.m[n][m] = abcmesh.global_transform[n * 4 + m];
					}
				}
			}
		}
	}

	UMScene.prototype._load_abc_point = function (abcio, abcpath) {
		var abcpoint,
			i,
			n,
			m,
			point,
			path_list,
			material;
		path_list = abcio.get_point_path_list(abcpath);
		console.log(path_list);
		for (i = 0; i < path_list.length; i = i + 1) {
			abcpoint = abcio.get_point(abcpath, path_list[i]);
			console.log(abcpoint);
			if (abcpoint && abcpoint.hasOwnProperty("position")) {
				console.log(abcpoint);
				point = new umpoint.UMPoint(this.gl, abcpoint.position, abcpoint.normal, abcpoint.color);
				console.log(abcpoint.global_transform);
				for (n = 0; n < 4; n = n + 1) {
					for (m = 0; m < 4; m = m + 1) {
						point.global_matrix.m[n][m] = abcpoint.global_transform[n * 4 + m];
					}
				}
				material = new ummaterial.UMMaterial(this.gl);
				material.set_polygon_count(abcpoint.position.length / 3 / 3);
				point.material_list.push(material);
				this.point_list.push(point);
			}
		}
	}

	UMScene.prototype._update_abc_point = function (abcio, abcpath) {
		var abcpoint,
			i,
			n,
			m,
			point,
			path_list,
			material;
		path_list = abcio.get_point_path_list(abcpath);
		for (i = 0; i < path_list.length; i = i + 1) {
			abcpoint = abcio.get_point(abcpath, path_list[i]);
			point = this.point_list[i];

			if (abcpoint && abcpoint.hasOwnProperty("position")) {
				point.update(abcpoint.position, abcpoint.normal, abcpoint.color);
				for (n = 0; n < 4; n = n + 1) {
					for (m = 0; m < 4; m = m + 1) {
						point.global_matrix.m[n][m] = abcpoint.global_transform[n * 4 + m];
					}
				}
			}
		}
	}

	UMScene.prototype.load_abc = function (abcpath) {
		var abcio = require('alembic'),
			update_func;

		abcio.load(abcpath);
		this._load_abc_mesh(abcio, abcpath);
		this._load_abc_point(abcio, abcpath);
		update_func = (function (self) {
			return function () {
				abcio.set_time(abcpath, self.current_time);
				self._update_abc_mesh(abcio, abcpath);
				self._update_abc_point(abcio, abcpath);
			}
		}(this));
		this.update_func_list.push(update_func);
	};

	UMScene.prototype.dispose = function () {
		var i = 0;
		for (i = 0; i < this.mesh_list.length; i = i + 1) {
			this.mesh_list[i].dispose();
		}
		if (this.grid) {
			this.grid.dispose();
		}
		if (this.test_mesh) {
			this.test_mesh.dispose();
		}
		if (this.shader) {
			this.shader.dispose();
		}
	};

	window.umscene = {};
	window.umscene.UMScene = UMScene;

}(window.ummath, window.umline, window.ummesh, window.ummaterial, window.umcamera, window.umshader, window.umobj));
