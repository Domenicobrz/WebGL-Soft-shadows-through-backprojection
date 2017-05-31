var PostProcessProgram;
function createPostProcessProgram() {
	var Program = getShader("postprocvert", "postprocfrag", false);
 	Program.a1 = gl.getAttribLocation(Program, "pos");
 	Program.a2 = gl.getAttribLocation(Program, "coord");
     
 	Program.texture = gl.getUniformLocation(Program, "texture");

 	var vertices = [
		-1.0, -1.0, 0.0, 0.0,
		-1.0, +1.0, 0.0, 1.0,
		+1.0, -1.0, 1.0, 0.0,
 
		+1.0, -1.0, 1.0, 0.0,
		-1.0, +1.0, 0.0, 1.0,
		+1.0, +1.0, 1.0, 1.0
	];

 	Program.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, Program.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    PostProcessProgram = Program;
}


function drawLightMapToScreen() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	gl.useProgram(PostProcessProgram);
	gl.enableVertexAttribArray(PostProcessProgram.a1);
	gl.enableVertexAttribArray(PostProcessProgram.a2);

    gl.bindBuffer(gl.ARRAY_BUFFER, PostProcessProgram.buffer);
	gl.vertexAttribPointer(PostProcessProgram.a1, 2, gl.FLOAT, false, step * 4, 0);
	gl.vertexAttribPointer(PostProcessProgram.a2, 2, gl.FLOAT, false, step * 4, step * 2);


			gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, lightFBO.depthtexture);
	gl.uniform1i(PostProcessProgram.texture, 0);

	gl.drawArrays(gl.TRIANGLES, 0, 6);
}

// function drawPostProcess(now, deltatime) {
// 	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

// 	gl.useProgram(PostProcessProgram);
// 	gl.enableVertexAttribArray(PostProcessProgram.a1);
// 	gl.enableVertexAttribArray(PostProcessProgram.a2);

//     gl.bindBuffer(gl.ARRAY_BUFFER, PostProcessProgram.buffer);
// 	gl.vertexAttribPointer(PostProcessProgram.a1, 2, gl.FLOAT, false, step * 4, 0);
// 	gl.vertexAttribPointer(PostProcessProgram.a2, 2, gl.FLOAT, false, step * 4, step * 2);


// 			gl.activeTexture(gl.TEXTURE0);
// 		gl.bindTexture(gl.TEXTURE_2D, lightFBO.depthtexture);
// 	gl.uniform1i(PostProcessProgram.texture, 0);

// 	gl.drawArrays(gl.TRIANGLES, 0, 6);
// }








