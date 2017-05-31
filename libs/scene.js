function drawScene(deltatime) {
    gl.useProgram(MainProgram);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, MainProgram.buffer);
    gl.enableVertexAttribArray(MainProgram.a1);
    gl.enableVertexAttribArray(MainProgram.a2);
    gl.vertexAttribPointer(MainProgram.a1, 3, gl.FLOAT, false, step * 6, 0);
    gl.vertexAttribPointer(MainProgram.a2, 3, gl.FLOAT, false, step * 6, step * 3);

    mat4.identity(model);
    mat4.lookAt(view, [10, 10, 15], [0, 5, 0], [0, 1, 0]);
    mat4.perspective(projection, 45 / 180 * Math.PI, innerWidth / innerHeight, 1, 100);


    gl.uniformMatrix4fv(MainProgram.projection, false, projection);
    gl.uniformMatrix4fv(MainProgram.model,      false, model);
    gl.uniformMatrix4fv(MainProgram.view,       false, camera.getViewMatrix(deltatime, 0.3));
    // gl.uniformMatrix4fv(MainProgram.view,       false, view);


    gl.uniformMatrix4fv(MainProgram.lightviewproj,  false, lightviewproj);
    gl.uniform1f(MainProgram.lightmapFarPlaneSize, lightmapFarPlaneSize);
    gl.uniform1f(MainProgram.lightmapRes, lightShadowWidth);


    gl.uniform1f(MainProgram.searchTexelSpread, effectController.searchTexelSpread);
    gl.uniform1f(MainProgram.lightSize, effectController.lightSize);
    gl.uniform1f(MainProgram.debug, effectController.debug);

    gl.uniform3f(MainProgram.lightPos, lightPos[0], lightPos[1], lightPos[2]);

    gl.uniform2f(MainProgram.nearFarPlane, lightNearPlane, lightFarPlane);


			gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, lightFBO.depthtexture);
	gl.uniform1i(MainProgram.lightmap, 0);


    gl.drawArrays(gl.TRIANGLES, 0, MainProgram.nverts);
}



function createMainProgram() {
    var Program = getShader("mainv", "mainf", false);
    Program.a1  = gl.getAttribLocation(Program, "pos");
    Program.a2  = gl.getAttribLocation(Program, "normal");

    Program.projection = gl.getUniformLocation(Program, "projection");
    Program.model      = gl.getUniformLocation(Program, "model");
    Program.view       = gl.getUniformLocation(Program, "view");

    Program.lightviewproj  = gl.getUniformLocation(Program, "lightviewproj");
    Program.lightmap   = gl.getUniformLocation(Program, "lightmap");
    Program.lightPos   = gl.getUniformLocation(Program, "lightPos");
    Program.lightmapRes  = gl.getUniformLocation(Program, "lightmapRes");
    Program.lightmapFarPlaneSize  = gl.getUniformLocation(Program, "lightmapFarPlaneSize");

    Program.nearFarPlane  = gl.getUniformLocation(Program, "nearFarPlane");
    Program.searchTexelSpread  = gl.getUniformLocation(Program, "searchTexelSpread");
    Program.lightSize  = gl.getUniformLocation(Program, "lightSize");

    Program.debug  = gl.getUniformLocation(Program, "debug");

    var vertices = [];
    planeVertices(vertices);
    for(var i = 0; i < 2; i++)
    for(var j = 0; j < 2; j++)
    for(var r = 0; r < 2; r++)
        cubeVertices(vertices, i * 4, j * 4, r * 4);

    Program.nverts = vertices.length / 6;

    Program.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Program.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    window.MainProgram = Program;
}

function planeVertices(vertices) {
    vertices.push(-500, 0, -500,        0, 1, 0);
    vertices.push(+500, 0, -500,        0, 1, 0);
    vertices.push(-500, 0, +500,        0, 1, 0);

    vertices.push(-500, 0, +500,        0, 1, 0);
    vertices.push(+500, 0, -500,        0, 1, 0);
    vertices.push(+500, 0, +500,        0, 1, 0);
}

function cubeVertices(vertices, x, y, z) {
    vertices.push(
        -1.0 + x, -1.0 + 3.0 + y, -1.0 + z,  0.0,  0.0, -1.0,
         1.0 + x, -1.0 + 3.0 + y, -1.0 + z,  0.0,  0.0, -1.0,
         1.0 + x,  1.0 + 3.0 + y, -1.0 + z,  0.0,  0.0, -1.0,
         1.0 + x,  1.0 + 3.0 + y, -1.0 + z,  0.0,  0.0, -1.0,
        -1.0 + x,  1.0 + 3.0 + y, -1.0 + z,  0.0,  0.0, -1.0,
        -1.0 + x, -1.0 + 3.0 + y, -1.0 + z,  0.0,  0.0, -1.0,

        -1.0 + x, -1.0 + 3.0 + y,  1.0 + z,  0.0,  0.0,  1.0,
         1.0 + x, -1.0 + 3.0 + y,  1.0 + z,  0.0,  0.0,  1.0,
         1.0 + x,  1.0 + 3.0 + y,  1.0 + z,  0.0,  0.0,  1.0,
         1.0 + x,  1.0 + 3.0 + y,  1.0 + z,  0.0,  0.0,  1.0,
        -1.0 + x,  1.0 + 3.0 + y,  1.0 + z,  0.0,  0.0,  1.0,
        -1.0 + x, -1.0 + 3.0 + y,  1.0 + z,  0.0,  0.0,  1.0,

        -1.0 + x,  1.0 + 3.0 + y,  1.0 + z, -1.0,  0.0,  0.0,
        -1.0 + x,  1.0 + 3.0 + y, -1.0 + z, -1.0,  0.0,  0.0,
        -1.0 + x, -1.0 + 3.0 + y, -1.0 + z, -1.0,  0.0,  0.0,
        -1.0 + x, -1.0 + 3.0 + y, -1.0 + z, -1.0,  0.0,  0.0,
        -1.0 + x, -1.0 + 3.0 + y,  1.0 + z, -1.0,  0.0,  0.0,
        -1.0 + x,  1.0 + 3.0 + y,  1.0 + z, -1.0,  0.0,  0.0,

         1.0 + x,  1.0 + 3.0 + y,  1.0 + z,  1.0,  0.0,  0.0,
         1.0 + x,  1.0 + 3.0 + y, -1.0 + z,  1.0,  0.0,  0.0,
         1.0 + x, -1.0 + 3.0 + y, -1.0 + z,  1.0,  0.0,  0.0,
         1.0 + x, -1.0 + 3.0 + y, -1.0 + z,  1.0,  0.0,  0.0,
         1.0 + x, -1.0 + 3.0 + y,  1.0 + z,  1.0,  0.0,  0.0,
         1.0 + x,  1.0 + 3.0 + y,  1.0 + z,  1.0,  0.0,  0.0,

        -1.0 + x, -1.0 + 3.0 + y, -1.0 + z,  0.0, -1.0,  0.0,
         1.0 + x, -1.0 + 3.0 + y, -1.0 + z,  0.0, -1.0,  0.0,
         1.0 + x, -1.0 + 3.0 + y,  1.0 + z,  0.0, -1.0,  0.0,
         1.0 + x, -1.0 + 3.0 + y,  1.0 + z,  0.0, -1.0,  0.0,
        -1.0 + x, -1.0 + 3.0 + y,  1.0 + z,  0.0, -1.0,  0.0,
        -1.0 + x, -1.0 + 3.0 + y, -1.0 + z,  0.0, -1.0,  0.0,

        -1.0 + x,  1.0 + 3.0 + y, -1.0 + z,  0.0,  1.0,  0.0,
         1.0 + x,  1.0 + 3.0 + y, -1.0 + z,  0.0,  1.0,  0.0,
         1.0 + x,  1.0 + 3.0 + y,  1.0 + z,  0.0,  1.0,  0.0,
         1.0 + x,  1.0 + 3.0 + y,  1.0 + z,  0.0,  1.0,  0.0,
        -1.0 + x,  1.0 + 3.0 + y,  1.0 + z,  0.0,  1.0,  0.0,
        -1.0 + x,  1.0 + 3.0 + y, -1.0 + z,  0.0,  1.0,  0.0
    );
}