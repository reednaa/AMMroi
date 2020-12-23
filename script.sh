# Check for new changes to the github to ensure we don't break anything
GIT_SSH_COMMAND='ssh -i /etc/ssh/ssh_host_ecdsa_key' git pull
# Execute data.py
/root/.cache/pypoetry/virtualenvs/ammroi-3T3ZGD2A-py3.8/bin/python data.py
# Save
git commit *.csv -m "Automated Data Update"
GIT_SSH_COMMAND='ssh -i /etc/ssh/ssh_host_ecdsa_key' git push
