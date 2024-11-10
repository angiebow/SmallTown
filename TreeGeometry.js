THREE.TreeGeometry = {
  /*
   * Build branch surface geometry.
   */
  build: function(tree) {
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      const indices = [];
      const uvs = [];

      let index = 0;
      
      this.buildBranches(tree.root, vertices, indices, uvs, index);

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geometry.setIndex(indices);

      geometry.computeVertexNormals();

      return geometry;
  },

  /*
   * Build geometry recursively.
   */
  buildBranches: function(branch, vertices, indices, uvs, indexOffset) {
      const radiusSegments = branch.radiusSegments;
      const heightSegments = branch.segments.length - 1;
      let index = indexOffset;

      for (let y = 0; y <= heightSegments; y++) {
          const segment = branch.segments[y];
          vertices.push(...segment.vertices.flatMap(v => [v.x, v.y, v.z]));
          uvs.push(...segment.uvs.flatMap(uv => [uv.x, uv.y]));

          for (let x = 0; x <= radiusSegments; x++) {
              if (y < heightSegments && x < radiusSegments) {
                  const current = index + x + y * (radiusSegments + 1);
                  const next = current + radiusSegments + 1;

                  indices.push(current, next + 1, current + 1);
                  indices.push(current, next, next + 1);
              }
          }
      }

      branch.children.forEach(child => {
          this.buildBranches(child, vertices, indices, uvs, index + (radiusSegments + 1) * (heightSegments + 1));
      });
  },

  /*
   * Build line strips geometry for THREE.Line object.
   */
  buildLineStrips: function(tree) {
      const vertices = [];

      const recur = function(branch) {
          const segments = branch.segments;
          for (let i = 0, n = segments.length - 1; i < n; i++) {
              const s0 = segments[i];
              const s1 = segments[i + 1];
              vertices.push(s0.position.x, s0.position.y, s0.position.z);
              vertices.push(s1.position.x, s1.position.y, s1.position.z);
          }

          branch.children.forEach(child => recur(child));
      };

      recur(tree.root);

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      return geometry;
  },

  calculateLength: function(tree) {
      return this.calculateSegmentLength(tree.root);
  },

  calculateSegmentLength: function(branch) {
      let longest = 0.0;
      branch.children.forEach(child => {
          const len = this.calculateSegmentLength(child);
          if (len > longest) {
              longest = len;
          }
      });
      return longest + branch.calculateLength();
  }
};