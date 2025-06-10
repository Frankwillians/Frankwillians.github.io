async function updateGithubFile({
    path,
    content, // string (será convertido para base64)
    message = "Update via painel admin",
    branch = "main"
}) {
    const owner = "Frankwillians";
    const repo = "Frankwillians.github.io";
    if (!githubAccessToken) {
        alert("Você precisa estar autenticado com o GitHub.");
        return;
    }
    // 1. Pega o SHA do arquivo atual (necessário para editar)
    const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    let sha = undefined;
    try {
        const getResp = await fetch(getUrl, {
            headers: { Authorization: `token ${githubAccessToken}` }
        });
        if (getResp.ok) {
            const getData = await getResp.json();
            sha = getData.sha;
        }
    } catch (e) {
        // Se não existir, sha fica undefined (será criado)
    }

    // 2. Atualiza ou cria o arquivo
    const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const resp = await fetch(putUrl, {
        method: "PUT",
        headers: {
            Authorization: `token ${githubAccessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message,
            content: btoa(unescape(encodeURIComponent(content))),
            sha,
            branch
        })
    });
    if (resp.ok) {
        alert("Arquivo atualizado com sucesso no GitHub!");
    } else {
        const err = await resp.json();
        alert("Erro ao atualizar arquivo: " + (err.message || resp.statusText));
    }
}