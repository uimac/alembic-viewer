/*jslint devel:true */
/*global Float32Array */
(function (ummath) {
	"use strict";
	var UMLine;

	UMLine = function (gl, verts) {
		this.gl = gl;
		this.material_list = [];
		this.vertex_vbo = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_vbo);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		this.position_attr = null;
		this.normal_attr = null;
		this.uv_attr = null;
		this.global_matrix = new ummath.UMMat44d();
		this.global_matrix_location_ = null;
	};

	UMLine.prototype.dispose = function () {
		var gl = this.gl;
		gl.DeleteBuffers(1, this.vertex_vbo);
	};

	UMLine.prototype.init_attrib = function (shader) {
		var gl = this.gl;

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_vbo);
		if (!this.position_attr) {
			this.position_attr = gl.getAttribLocation(shader.program_object(), 'a_position');
		}
		gl.enableVertexAttribArray(this.position_attr);
		gl.vertexAttribPointer(this.position_attr, 3, gl.FLOAT, false, 0, 0);

		if (!this.normal_attr) {
			this.normal_attr = gl.getAttribLocation(shader.program_object(), 'a_normal');
		}
		gl.disableVertexAttribArray(this.normal_attr);
		if (!this.uv_attr) {
			this.uv_attr = gl.getAttribLocation(shader.program_object(), 'a_uv');
		}
		gl.disableVertexAttribArray(this.uv_attr);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	};

	UMLine.prototype.draw = function (shader, camera) {
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

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_vbo);
		for (i = 0; i < this.material_list.length; i = i + 1) {
			material = this.material_list[i];
			index_count = material.polygon_count() * 2;

			camera.draw(shader);
			material.draw(shader);
			gl.drawArrays(gl.LINES, index_offset, index_count);
			index_offset = index_offset + index_count;
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	};

	UMLine.prototype.reset_shader_location = function () {
		this.global_matrix_location_ = null;
	};

	window.umline = {};
	window.umline.UMLine = UMLine;

}(window.ummath));
