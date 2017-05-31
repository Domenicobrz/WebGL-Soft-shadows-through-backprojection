var lightFBO;
var lightShadowWidth  = 1024;
var lightShadowHeight = 1024;
var lightPos = [0,0,0];
//this renderbuffer provides DEPTH ONLY - change to include stencilBuffer
function createLightFBO() {
	var FBO = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, FBO);


    // providing a color texture for backward compatibility
    // http://blog.tojicode.com/2012/07/using-webgldepthtexture.html
    FBO.colortexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, FBO.colortexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, lightShadowWidth, lightShadowHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);


    FBO.depthtexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, FBO.depthtexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, lightShadowWidth, lightShadowHeight, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
    
    
    
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, FBO.colortexture, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, FBO.depthtexture, 0);


    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    lightFBO = FBO;
}

function drawLightMap(now) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, lightFBO);
    gl.clear(gl.DEPTH_BUFFER_BIT);


    gl.useProgram(LightMapProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, LightMapProgram.buffer);
    gl.enableVertexAttribArray(LightMapProgram.a1);
    gl.enableVertexAttribArray(LightMapProgram.a2);
    gl.vertexAttribPointer(LightMapProgram.a1, 3, gl.FLOAT, false, step * 6, 0);
    gl.vertexAttribPointer(LightMapProgram.a2, 3, gl.FLOAT, false, step * 6, step * 3);

    mat4.identity(model);


    lightPos[0] = 0;
    lightPos[1] = 18;
    lightPos[2] = 0;
    if(effectController.rotateLight) {
        lightPos[0] += Math.sin(now) * 20.0;
        lightPos[2] += Math.cos(now) * 20.0;
    }
    
    
                               // eye,     center,     up
    mat4.lookAt(lightview, lightPos, [0, 6, 0], [0, 1, 0]);

    // 90° FOV and 1/1 aspect ratio
    mat4.perspective(lightprojection, Math.PI / 2, 1, 5, 100);
    mat4.multiply(lightviewproj, lightprojection, lightview);

    gl.uniformMatrix4fv(LightMapProgram.projection, false, lightprojection);
    gl.uniformMatrix4fv(LightMapProgram.model,      false, model);
    gl.uniformMatrix4fv(LightMapProgram.view,       false, lightview);
    // gl.uniformMatrix4fv(LightMapProgram.view,       false, view);
    // gl.uniform1f(LightMapProgram.time, now);


    gl.colorMask(false, false, false, false);
    // gl.colorMask(true, true, true, true);
    gl.viewport(0, 0, lightShadowWidth, lightShadowHeight);
    gl.drawArrays(gl.TRIANGLES, 0, LightMapProgram.nverts);
    

    mat4.identity(view);    
    gl.colorMask(true, true, true, true);
    gl.viewport(0, 0, canvas.width, canvas.height);        
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function createLightMapProgram() {
    var Program = getShader("lightmapv", "lightmapf", false);
    Program.a1  = gl.getAttribLocation(Program, "pos");
    Program.a2  = gl.getAttribLocation(Program, "normal");

    Program.projection = gl.getUniformLocation(Program, "projection");
    Program.model      = gl.getUniformLocation(Program, "model");
    Program.view       = gl.getUniformLocation(Program, "view");

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

    window.LightMapProgram = Program;
}