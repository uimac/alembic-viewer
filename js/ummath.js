/*jslint devel:true*/
(function () {
	"use strict";
	var UMVec3d,
		UMVec4d,
		UMMat44d,
		UMBox,
		EPSILON = 0.00001;

	UMVec3d = function (x, y, z) {
		this.xyz = [0.0, 0.0, 0.0];
		if (x && x instanceof Array) {
			this.xyz = x;
		} else {
			if (x) { this.xyz[0] = x; }
			if (y) { this.xyz[1] = y; }
			if (z) { this.xyz[2] = z; }
		}
	};

	UMVec3d.prototype.x = function () {
		return this.xyz[0];
	};

	UMVec3d.prototype.y = function () {
		return this.xyz[1];
	};

	UMVec3d.prototype.z = function () {
		return this.xyz[2];
	};

	UMVec3d.prototype.at = function (index) {
		return this.xyz[index];
	};

	UMVec3d.prototype.dot = function (v) {
		return this.xyz[0] * v.xyz[0] + this.xyz[1] * v.xyz[1] + this.xyz[2] * v.xyz[2];
	};

	UMVec3d.prototype.scale = function (s) {
		this.xyz[0] = this.xyz[0] * s;
		this.xyz[1] = this.xyz[1] * s;
		this.xyz[2] = this.xyz[2] * s;
		return this;
	};

	UMVec3d.prototype.cross = function (v) {
		return new UMVec3d(
			this.y() * v.z() - this.z() * v.y(),
			this.z() * v.x() - this.x() * v.z(),
			this.x() * v.y() - this.y() * v.x()
		);
	};

	UMVec3d.prototype.add = function (v) {
		return new UMVec3d(this.x() + v.x(), this.y() + v.y(), this.z() + v.z());
	};

	UMVec3d.prototype.sub = function (v) {
		return new UMVec3d(this.x() - v.x(), this.y() - v.y(), this.z() - v.z());
	};

	UMVec3d.prototype.multiply = function (v) {
		return new UMVec3d(this.x() * v.x(), this.y() * v.y(), this.z() * v.z());
	};

	UMVec3d.prototype.normalized = function () {
		var dst = new UMVec3d(this.x(), this.y(), this.z()),
			a = this.x() * this.x() + this.y() * this.y() + this.z() * this.z(),
			b;
		if (a > EPSILON) {
			b = 1.0 / Math.sqrt(a);
			dst.xyz[0] = this.x() * b;
			dst.xyz[1] = this.y() * b;
			dst.xyz[2] = this.z() * b;
		} else {
			dst.xyz[0] = dst.xyz[1] = dst.xyz[2] = 0;
		}
		return dst;
	};

	UMVec3d.prototype.length_sq = function () {
		return this.dot(this);
	};

	UMVec3d.prototype.length = function () {
		return Math.sqrt(this.length_sq());
	};

	//------------------------------------------------------------------------

	UMVec4d = function (x, y, z, w) {
		this.xyzw = [0.0, 0.0, 0.0, 0.0];
		if (x && x instanceof Array) {
			this.xyzw = x;
		} else {
			if (x) { this.xyzw[0] = x; }
			if (y) { this.xyzw[1] = y; }
			if (z) { this.xyzw[2] = z; }
			if (w) { this.xyzw[3] = w; }
		}
	};

	UMVec4d.prototype.x = function () {
		return this.xyzw[0];
	};

	UMVec4d.prototype.y = function () {
		return this.xyzw[1];
	};

	UMVec4d.prototype.z = function () {
		return this.xyzw[2];
	};

	UMVec4d.prototype.w = function () {
		return this.xyzw[3];
	};

	UMVec4d.prototype.at = function (index) {
		return this.xyzw[index];
	};

	UMVec4d.prototype.dot = function (v) {
		return this.xyzw[0] * v.xyzw[0] + this.xyzw[1] * v.xyzw[1] + this.xyzw[2] * v.xyzw[2] + this.xyzw[3] * v.xyzw[3];
	};

	UMVec4d.prototype.scale = function (s) {
		this.xyzw[0] = this.xyzw[0] * s;
		this.xyzw[1] = this.xyzw[1] * s;
		this.xyzw[2] = this.xyzw[2] * s;
		this.xyzw[3] = this.xyzw[3] * s;
	};

	UMVec4d.prototype.cross = function (v1, v2) {
		return new UMVec4d((this.y() * (v1.z() * v2.w() - v2.z() * v1.w())
			- this.z() * (v1.y() * v2.w() - v2.y() * v1.w())
			+ this.w() * (v1.y() * v2.z() - v1.z() * v2.y())),
			-(this.x() * (v1.z() * v2.w() - v2.z() * v1.w())
			- this.z() * (v1.x() * v2.w() - v2.x() * v1.w())
			+ this.w() * (v1.x() * v2.z() - v1.z() * v2.x())),
			 (this.x() * (v1.y() * v2.w() - v2.y() * v1.w())
			- this.y() * (v1.x() * v2.w() - v2.x()) * v1.w()
			+ this.w() * (v1.x() * v2.y() - v2.x() * v1.y())),
			-(this.x() * (v1.y() * v2.z() - v2.y() * v1.z())
			- this.y() * (v1.x() * v2.z() - v2.x() * v1.z())
			+ this.z() * (v1.x() * v2.y() - v2.x() * v1.y()))
			);
	};

	UMVec4d.prototype.add = function (v) {
		if (v instanceof UMVec4d) {
			return new UMVec4d(this.x() + v.x(), this.y() + v.y(), this.z() + v.z(), this.w() + v.w());
		} else {
			return new UMVec3d(this.x() + v.x(), this.y() + v.y(), this.z() + v.z());
		}
	};

	UMVec4d.prototype.sub = function (v) {
		return new UMVec4d(this.x() - v.x(), this.y() - v.y(), this.z() - v.z(), this.w() - v.w());
	};

	UMVec4d.prototype.multiply = function (v) {
		return new UMVec4d(this.x() * v.x(), this.y() * v.y(), this.z() * v.z(), this.w() * v.w());
	};

	UMVec4d.prototype.normalized = function () {
		var dst = new UMVec4d(this.x(), this.y(), this.z(), this.w()),
			a = this.x() * this.x() + this.y() * this.y() + this.z() * this.z() + this.w() * this.w(),
			b;
		if (a > EPSILON) {
			b = 1.0 / Math.sqrt(a);
			dst.xyzw[0] = this.x() * b;
			dst.xyzw[1] = this.y() * b;
			dst.xyzw[2] = this.z() * b;
			dst.xyzw[3] = this.w() * b;
		} else {
			dst.xyzw[0] = dst.xyzw[1] = dst.xyzw[2] = dst.xyzw[3] = 0;
		}
		return dst;
	};

	UMVec4d.prototype.length_sq = function () {
		return this.dot(this);
	};

	UMVec4d.prototype.length = function () {
		return Math.sqrt(this.length_sq());
	};

	//------------------------------------------------------------------------

	UMMat44d = function (mat) {
		var i,
			k;
		this.m = [[0.0, 0.0, 0.0, 0.0], [0.0, 0.0, 0.0, 0.0], [0.0, 0.0, 0.0, 0.0], [0.0, 0.0, 0.0, 0.0]];
		if (mat) {
			for (i = 0; i < 4; i = i + 1) {
				for (k = 0; k < 4; k = k + 1) {
					this.m[i][k] = mat.m[i][k];
				}
			}
		} else {
			for (i = 0; i < 4; i = i + 1) {
				for (k = 0; k < 4; k = k + 1) {
					this.m[i][k] = (i === k) ? 1 : 0;
				}
			}
		}
	};

	UMMat44d.prototype.value = function () {
		return [this.m[0][0], this.m[0][1], this.m[0][2], this.m[0][3],
				this.m[1][0], this.m[1][1], this.m[1][2], this.m[1][3],
				this.m[2][0], this.m[2][1], this.m[2][2], this.m[2][3],
				this.m[3][0], this.m[3][1], this.m[3][2], this.m[3][3]
			   ];
	};

	UMMat44d.prototype.multiply = function (vecOrMat) {
		var i,
			j,
			k,
			tmp,
			dst;
		if (vecOrMat instanceof UMMat44d) {
			dst = new UMMat44d();
			for (i = 0; i < 4; i = i + 1) {
				for (j = 0; j < 4; j = j + 1) {
					dst.m[i][j] = 0.0;
					for (k = 0; k < 4; k = k + 1) {
						dst.m[i][j] += this.m[i][k] * vecOrMat.m[k][j];
					}
				}
			}
		} else if (vecOrMat instanceof UMVec4d) {
			tmp = [
				vecOrMat.at(0) * this.m[0][0] + vecOrMat.at(1) * this.m[1][0] + vecOrMat.at(2) * this.m[2][0] + vecOrMat.at(3) * this.m[3][0],
				vecOrMat.at(0) * this.m[0][1] + vecOrMat.at(1) * this.m[1][1] + vecOrMat.at(2) * this.m[2][1] + vecOrMat.at(3) * this.m[3][1],
				vecOrMat.at(0) * this.m[0][2] + vecOrMat.at(1) * this.m[1][2] + vecOrMat.at(2) * this.m[2][2] + vecOrMat.at(3) * this.m[3][2],
				vecOrMat.at(0) * this.m[0][3] + vecOrMat.at(1) * this.m[1][3] + vecOrMat.at(2) * this.m[2][3] + vecOrMat.at(3) * this.m[3][3]
			];
			dst = new UMVec4d(tmp[0], tmp[1], tmp[2], tmp[3]);
		} else if (vecOrMat instanceof UMVec3d) {
			tmp = [
				vecOrMat.at(0) * this.m[0][0] + vecOrMat.at(1) * this.m[1][0] + vecOrMat.at(2) * this.m[2][0],
				vecOrMat.at(0) * this.m[0][1] + vecOrMat.at(1) * this.m[1][1] + vecOrMat.at(2) * this.m[2][1],
				vecOrMat.at(0) * this.m[0][2] + vecOrMat.at(1) * this.m[1][2] + vecOrMat.at(2) * this.m[2][2]
			];
			dst = new UMVec3d(tmp[0], tmp[1], tmp[2]);
		}
		return dst;
	};

	UMMat44d.prototype.identity = function () {
		var i,
			k;
		for (i = 0; i < 4; i = i + 1) {
			for (k = 0; k < 4; k = k + 1) {
				this.m[i][k] = (i === k) ? 1 : 0;
			}
		}
	};

	UMMat44d.prototype.transposed = function () {
		var i,
			k,
			dst = new UMMat44d();
		for (i = 0; i < 4; i = i + 1) {
			for (k = 0; k < 4; k = k + 1) {
				dst.m[k][i] = this.m[i][k];
			}
		}
		return dst;
	};

	UMMat44d.prototype.determinant = function () {
		var temp_a = (this.m[2][2] * this.m[3][3]) - (this.m[2][3] * this.m[3][2]),
			temp_b = (this.m[2][1] * this.m[3][3]) - (this.m[2][3] * this.m[3][1]),
			temp_c = (this.m[2][1] * this.m[3][2]) - (this.m[2][2] * this.m[3][1]),
			temp_d = (this.m[2][0] * this.m[3][3]) - (this.m[2][3] * this.m[3][0]),
			temp_e = (this.m[2][0] * this.m[3][2]) - (this.m[2][2] * this.m[3][0]),
			temp_f = (this.m[2][0] * this.m[3][1]) - (this.m[2][1] * this.m[3][0]);
		return (this.m[0][0] * this.m[1][1]) * (temp_a)
			- (this.m[0][0] * this.m[1][2]) * (temp_b)
			+ (this.m[0][0] * this.m[1][3]) * (temp_c)
			- (this.m[0][1] * this.m[1][0]) * (temp_a)
			+ (this.m[0][1] * this.m[1][2]) * (temp_d)
			- (this.m[0][1] * this.m[1][3]) * (temp_e)
			+ (this.m[0][2] * this.m[1][0]) * (temp_b)
			- (this.m[0][2] * this.m[1][1]) * (temp_d)
			+ (this.m[0][2] * this.m[1][3]) * (temp_f)
			- (this.m[0][3] * this.m[1][0]) * (temp_c)
			+ (this.m[0][3] * this.m[1][1]) * (temp_e)
			- (this.m[0][3] * this.m[1][2]) * (temp_f);
	};

	UMMat44d.prototype.inverted = function () {
		var dst = new UMMat44d(),
			vec = [new UMVec4d(), new UMVec4d(), new UMVec4d()],
			det = this.determinant(),
			i,
			j,
			k,
			a,
			v,
			rev_det;

		if (!det) { return dst; }

		for (i = 0; i < 4; i = i + 1) {
			for (j = 0; j < 4; j = j + 1) {
				if (j !== i) {
					a = j;
					if (j > i) { a = a - 1; }
					vec[a].xyzw[0] = this.m[j][0];
					vec[a].xyzw[1] = this.m[j][1];
					vec[a].xyzw[2] = this.m[j][2];
					vec[a].xyzw[3] = this.m[j][3];
				}
			}

			v = new UMVec4d(vec[0].xyzw[0], vec[0].xyzw[1], vec[0].xyzw[2], vec[0].xyzw[3]);
			v = v.cross(vec[1], vec[2]);
			rev_det = 1.0 / det;
			dst.m[0][i] = Math.pow(-1.0, i) * v.x() * rev_det;
			dst.m[1][i] = Math.pow(-1.0, i) * v.y() * rev_det;
			dst.m[2][i] = Math.pow(-1.0, i) * v.z() * rev_det;
			dst.m[3][i] = Math.pow(-1.0, i) * v.w() * rev_det;
		}
		return dst;
	};

	UMMat44d.prototype.translation = function () {
		return new UMVec3d(this.m[3][0], this.m[3][1], this.m[3][2]);
	};

	//------------------------------------------------------------------------

	/**
	 * @param min UMVec3d
	 * @param max UMVec3d
	 */
	UMBox = function (min, max) {
		this.min_ = min;
		this.max_ = max;
	};

	UMBox.prototype.init = function () {
		this.set_min(new UMVec3d(Infinity, Infinity, Infinity));
		this.set_max(new UMVec3d(-Infinity, -Infinity, -Infinity));
	};

	UMBox.prototype.min = function () {
		return this.min_;
	};

	UMBox.prototype.max = function () {
		return this.max_;
	};

	UMBox.prototype.set_min = function (min) {
		this.min_ = min;
	};

	UMBox.prototype.set_max = function (max) {
		this.max_ = max;
	};

	UMBox.prototype.extend = function (val) {
		if (val instanceof Array) {
			this.min_.xyz[0] = Math.min(this.min_.xyz[0], val[0]);
			this.min_.xyz[1] = Math.min(this.min_.xyz[1], val[1]);
			this.min_.xyz[2] = Math.min(this.min_.xyz[2], val[2]);
			this.max_.xyz[0] = Math.max(this.max_.xyz[0], val[0]);
			this.max_.xyz[1] = Math.max(this.max_.xyz[1], val[1]);
			this.max_.xyz[2] = Math.max(this.max_.xyz[2], val[2]);
		} else if (val instanceof UMVec3d) {
			this.min_.xyz[0] = Math.min(this.min_.xyz[0], val.xyz[0]);
			this.min_.xyz[1] = Math.min(this.min_.xyz[1], val.xyz[1]);
			this.min_.xyz[2] = Math.min(this.min_.xyz[2], val.xyz[2]);
			this.max_.xyz[0] = Math.max(this.max_.xyz[0], val.xyz[0]);
			this.max_.xyz[1] = Math.max(this.max_.xyz[1], val.xyz[1]);
			this.max_.xyz[2] = Math.max(this.max_.xyz[2], val.xyz[2]);
		} else if (val instanceof UMBox){
			this.min_.xyz[0] = Math.min(this.min_.xyz[0], box.min_.xyz[0]);
			this.min_.xyz[1] = Math.min(this.min_.xyz[1], box.min_.xyz[1]);
			this.min_.xyz[2] = Math.min(this.min_.xyz[2], box.min_.xyz[2]);
			this.max_.xyz[0] = Math.max(this.max_.xyz[0], box.max_.xyz[0]);
			this.max_.xyz[1] = Math.max(this.max_.xyz[1], box.max_.xyz[1]);
			this.max_.xyz[2] = Math.max(this.max_.xyz[2], box.max_.xyz[2]);
		}
	};

	UMBox.prototype.center = function () {
		return new UMVec3d(
			(min_.xyz[0] + max_.xyz[0]) * 0.5,
			(min_.xyz[1] + max_.xyz[1]) * 0.5,
			(min_.xyz[2] + max_.xyz[2]) * 0.5
		)
	};

	UMBox.prototype.is_empty = function () {
		return min_.x >= max_.x || min_.y >= max_.y || min_.z >= max_.z;
	}

	/**
	 * @param src UMMat44d
	 */
	function um_matrix_to_euler_xyz(src) {
		var euler = new UMVec3d(),
			r00 = src.m[0][0],
			r01 = src.m[0][1],
			r02 = src.m[0][2],
			r10 = src.m[1][0],
			r11 = src.m[1][1],
			r12 = src.m[1][2],
			r20 = src.m[2][0],
			r21 = src.m[2][1],
			r22 = src.m[2][2];

		if (r02 < 1) {
			if (r02 > -1) {
				euler.xyz[1] = Math.asin(r02); // y
				euler.xyz[0] = Math.atan2(-r12, r22); // x
				euler.xyz[2]  = Math.atan2(-r01, r00); // z
			} else {
				euler.xyz[1] = -Math.PI / 2.0; // y
				euler.xyz[0] = -Math.atan2(r10, r11); // x
				euler.xyz[2] = 0; // z
			}
		} else {
			euler.xyz[1] = Math.PI / 2.0; // y
			euler.xyz[0] = Math.atan2(r10, r11); // x
			euler.xyz[2] = 0; // z
		}
		return euler;
	}

	/**
	 * @param src UMVec3d
	 */
	function um_euler_to_matrix_xyz(src) {
		var dst = new UMMat44d(),
			cx = Math.cos(src.x()),
			cy = Math.cos(src.y()),
			cz = Math.cos(src.z()),
			sx = Math.sin(src.x()),
			sy = Math.sin(src.y()),
			sz = Math.sin(src.z());

		dst.m[0][0] = cy * cz;
		dst.m[0][1] = -cy * sz;
		dst.m[0][2] = sy;

		dst.m[1][0] = cz * sx * sy + cx * sz;
		dst.m[1][1] = cx * cz - sx * sy * sz;
		dst.m[1][2] = -cy * sx;

		dst.m[2][0] = -cx * cz * sy + sx * sz;
		dst.m[2][1] = cz * sx + cx * sy * sz;
		dst.m[2][2] = cx * cy;

		return dst;
	}

	/**
	 * @param dst UMMat44d
	 * @param w float
	 * @param h float
	 * @param zn float
	 * @param zf float
	 */
	function um_matrix_ortho_rh(dst, w, h, zn, zf) {
		dst.m[0][0] = 2 / w;
		dst.m[1][0] = 0.0;
		dst.m[2][0] = 0.0;
		dst.m[3][0] = 0.0;

		dst.m[0][1] = 0.0;
		dst.m[1][1] = 2 / h;
		dst.m[2][1] = 0.0;
		dst.m[3][1] = 0.0;

		dst.m[0][2] = 0.0;
		dst.m[1][2] = 0.0;
		dst.m[2][2] = 1 / (zn - zf);
		dst.m[3][2] = zn / (zn - zf);

		dst.m[0][3] = 0.0;
		dst.m[1][3] = 0.0;
		dst.m[2][3] = 0.0;
		dst.m[3][3] = 1.0;
	}

	/**
	 * @param dst UMMat44d
	 * @param w float
	 * @param h float
	 * @param zn float
	 * @param zf float
	 */
	function um_matrix_perspective_rh(dst, w, h, zn, zf) {
		dst.m[0][0] = 2 * zn / w;
		dst.m[1][0] = 0.0;
		dst.m[2][0] = 0.0;
		dst.m[3][0] = 0.0;

		dst.m[0][1] = 0.0;
		dst.m[1][1] = 2 * zn / h;
		dst.m[2][1] = 0.0;
		dst.m[3][1] = 0.0;

		dst.m[0][2] = 0.0;
		dst.m[1][2] = 0.0;
		dst.m[2][2] = zf / (zn - zf);
		dst.m[3][2] = zn * zf / (zn - zf);

		dst.m[0][3] = 0.0;
		dst.m[1][3] = 0.0;
		dst.m[2][3] = -1.0;
		dst.m[3][3] = 0.0;
	}

	/**
	 * @param dst UMMat44d
	 * @param fov_y float
	 * @param aspect float
	 * @param zn float
	 * @param zf float
	 */
	function um_matrix_perspective_fov_rh(dst, fov_y, aspect, zn, zf) {
		var h = 1.0 / Math.tan(fov_y / 2.0),
			w,
			zn_zf;

		if (EPSILON < Math.abs(aspect)) {
			w = h / aspect;
		} else {
			w = 0;
		}

		zn_zf = zn - zf;

		dst.m[0][0] = w;
		dst.m[1][0] = 0.0;
		dst.m[2][0] = 0.0;
		dst.m[3][0] = 0.0;

		dst.m[0][1] = 0.0;
		dst.m[1][1] = h;
		dst.m[2][1] = 0.0;
		dst.m[3][1] = 0.0;

		dst.m[0][2] = 0.0;
		dst.m[1][2] = 0.0;
		if ((zn_zf < -EPSILON) || (EPSILON < zn_zf)) {
			dst.m[2][2] = zf / zn_zf;
			dst.m[3][2] = zn * zf / zn_zf;
		} else {
			dst.m[2][2] = 0.0;
			dst.m[3][2] = 0.0;
		}

		dst.m[0][3] = 0.0;
		dst.m[1][3] = 0.0;
		dst.m[2][3] = -1.0;
		dst.m[3][3] = 0.0;
	}

	/**
	 * @param dst UMMat44d
	 * @param eye UMVec3d
	 * @param at UMVec3d
	 * @param up UMVec3d
	 */
	function um_matrix_look_at_rh(dst, eye, at, up) {
		var zaxis = ((eye.sub(at)).normalized()),
			xaxis = ((up.cross(zaxis)).normalized()),
			yaxis = (zaxis.cross(xaxis));

		dst.m[0][0] = xaxis.x();
		dst.m[1][0] = xaxis.y();
		dst.m[2][0] = xaxis.z();
		dst.m[3][0] = -xaxis.dot(eye);

		dst.m[0][1] = yaxis.x();
		dst.m[1][1] = yaxis.y();
		dst.m[2][1] = yaxis.z();
		dst.m[3][1] = -yaxis.dot(eye);

		dst.m[0][2] = zaxis.x();
		dst.m[1][2] = zaxis.y();
		dst.m[2][2] = zaxis.z();
		dst.m[3][2] = -zaxis.dot(eye);

		dst.m[0][3] = 0.0;
		dst.m[1][3] = 0.0;
		dst.m[2][3] = 0.0;
		dst.m[3][3] = 1.0;
	}

	/**
	 * convert degree to radian
	 */
	function um_to_radian(degree) { return ((degree) * (Math.PI / 180.0)); }

	/**
	 * convert radian to degree
	 */
	function um_to_degree(radian) { return ((radian) * (180.0 / Math.PI)); }

	/**
	 * signum
	 */
	function um_sign(val) {
		return (0 < val) - (val < 0);
	}

	window.ummath = {};
	window.ummath.UMMat44d = UMMat44d;
	window.ummath.UMVec3d = UMVec3d;
	window.ummath.UMVec4d = UMVec4d;
	window.ummath.UMBox = UMBox;
	window.ummath.um_matrix_to_euler_xyz = um_matrix_to_euler_xyz;
	window.ummath.um_euler_to_matrix_xyz = um_euler_to_matrix_xyz;
	window.ummath.um_matrix_ortho_rh = um_matrix_ortho_rh;
	window.ummath.um_matrix_perspective_rh = um_matrix_perspective_rh;
	window.ummath.um_matrix_perspective_fov_rh = um_matrix_perspective_fov_rh;
	window.ummath.um_matrix_look_at_rh = um_matrix_look_at_rh;
	window.ummath.um_to_radian = um_to_radian;
	window.ummath.um_to_degree = um_to_degree;
	window.ummath.um_sign = um_sign;
	window.ummath.EPSILON = EPSILON;
}());
