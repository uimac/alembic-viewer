/*jslint devel:true*/
/*global Float32Array */
(function (ummath) {
	"use strict";
	var UMPoint;

	UMPoint = function (gl, positions, normals, colors) {
		this.gl = gl;
		this.material_list = [];
		this.position_vbo = gl.createBuffer();

		if (normals && normals.length > 0) {
			this.normal_vbo = gl.createBuffer();
		}

		this.box = new ummath.UMBox();
		this.global_matrix = new ummath.UMMat44d();
		this.global_matrix_location_ = null;
		this.update(positions, normals, colors);
		this.update_box();
	};

	UMPoint.prototype.update = function (positions, normals, colors) {
		var gl = this.gl;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.position_vbo);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		if (normals && normals.length > 0) {
			gl.bindBuffer(gl.ARRAY_BUFFER, this.normal_vbo);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
		}
		this.positions = positions;
		this.normals = normals;
		this.colors = colors;
		//this.update_box();
	}

	UMPoint.prototype.dispose = function () {
		var gl = this.gl;
		gl.deleteBuffer(this.vertex_vbo);
		gl.deleteBuffer(this.normal_vbo);
		if (this.uv_vbo) {
			gl.deleteBuffer(this.uv_vbo);
		}
		if (this.index_buffer) {
			gl.deleteBuffer(this.index_buffer);
		}
		//glDeleteBuffers(1, &vertex_index_vbo_);
	};

	UMPoint.prototype.init_attrib = function (shader) {
		var gl = this.gl,
			position_attr,
			normal_attr,
			uv_attr;

		gl.bindBuffer(gl.ARRAY_BUFFER, this.position_vbo);
		position_attr = gl.getAttribLocation(shader.program_object(), 'a_position');
		gl.enableVertexAttribArray(position_attr);
		gl.vertexAttribPointer(position_attr, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normal_vbo);
		normal_attr = gl.getAttribLocation(shader.program_object(), 'a_normal');
		gl.disableVertexAttribArray(normal_attr);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.uv_vbo);
		uv_attr = gl.getAttribLocation(shader.program_object(), 'a_uv');
		gl.disableVertexAttribArray(uv_attr);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	};

	UMPoint.prototype.draw = function (shader, camera) {
		var i,
			gl = this.gl,
			index_count,
			index_offset = 0,
			material;

		gl.useProgram(shader.program_object());
		this.init_attrib(shader);

		if (!this.global_matrix_location_) {
			this.global_matrix_location_ = gl.getUniformLocation(shader.program_object(), "global_matrix");
		}
		gl.uniformMatrix4fv(this.global_matrix_location_, false, this.global_matrix.value());

		gl.bindBuffer(gl.ARRAY_BUFFER, this.point_vbo);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normal_vbo);
		if (this.color_vbo) {
			gl.bindBuffer(gl.ARRAY_BUFFER, this.color_vbo);
		}

		for (i = 0; i < this.material_list.length; i = i + 1) {
			material = this.material_list[i];
			index_count = material.polygon_count() * 3;

			camera.draw(shader);
			material.draw(shader);
			gl.drawArrays(gl.POINTS, index_offset, index_count);
			index_offset = index_offset + index_count;
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	};

	UMPoint.prototype.reset_shader_location = function () {
		var i;
		this.global_matrix_location_ = null;
		for (i = 0; i < this.material_list.length; i = i + 1) {
			this.material_list[i].reset_shader_location();
		}
	};

	UMPoint.prototype.update_box = function () {
		var i,
			vlen;
		this.box.set_min(new ummath.UMVec3d(Infinity, Infinity, Infinity));
		this.box.set_max(new ummath.UMVec3d(-Infinity, -Infinity, -Infinity));
 		vlen = this.positions.length / 3;
		for (i = 0; i < vlen; i = i + 1) {
			this.box.extend([this.positions[i * 3 + 0], this.positions[i * 3 + 1], this.positions[i * 3 + 2]]);
		}
		console.log("box updated", this.box.min(), this.box.max());
	};

	window.umpoint = {};
	window.umpoint.UMPoint = UMPoint;

}(window.ummath));
