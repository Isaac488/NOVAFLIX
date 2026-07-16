from functools import wraps

from flask import session
from flask import redirect
from flask import url_for
from flask import abort


def login_required(f):

    @wraps(f)
    def decorated(*args, **kwargs):

        if "user_id" not in session:
            return redirect(url_for("auth.login"))

        return f(*args, **kwargs)

    return decorated


def admin_required(f):

    @wraps(f)
    def decorated(*args, **kwargs):

        if session.get("rol") != "admin":
            abort(403)

        return f(*args, **kwargs)

    return decorated