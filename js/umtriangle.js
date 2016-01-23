/*jslint devel:true*/
/*global Float32Array */
(function (ummath) {
	var UMTriangle;

	UMTriangle = function (mesh, face_index) {
		this.mesh_ = mesh;
		this.face_index_ = face_index;
		this.box = new ummath.UMBox();
		this.box.init();
	};

	/**
	 * @param ray_dir UMVec3d
 	 * @param ray_org UMVec3d
	 */
	UMTriangle.prototype.intersects = function (ray_dir, ray_org) {
		var a = this.mesh_.get_vert(this.face_index_, 0),
			b = this.mesh_.get_vert(this.face_index_, 1),
			c = this.mesh_.get_vert(this.face_index_, 2),
			ab,
			ac,
			ao,
			n,
			d,
			t,
			distance,
			barycentric,
			ray_dir_inv = new ummath.UMVec3d(-ray_dir.xyz[0], -ray_dir.xyz[1], -ray_dir.xyz[2])
			v,
			w;

		ab = b.sub(a);
		ac = c.sub(a);
		n = ab.cross(ac);

		// ray is parallel or no reach
		d = ray_dir_inv.dot(n);
		if (d < 0) { return false; }

		ao = ray_org.sub(a);
		t = ao.dot(n);
		if (t < 0) { return false; }

		distance = t / d;
		if (distance < ummath.EPSILON) { return false; }

		// inside triangle ?
		barycentric = ray_dir_inv.cross(ao);
		v = ac.dot(barycentric);
		if (v < 0 || v > d) { return false; }
		ab.scale(-1);
		w = ab.dot(barycentric);
		if (w < 0 || (v + w) > d) { return false; }
		return true;
	};

	UMTriangle.prototype.update_box = function() {
		var i,
			mesh = this.mesh_;
		this.box.init();
		for (i = 0; i < 3; i = i + 1) {
			this.box.extend(this.mesh_.get_vert(this.face_index_, i));
		}
	};

	window.umtriangle = {};
	window.umtriangle.UMTriangle = UMTriangle;

}(window.ummath));
