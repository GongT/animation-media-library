<?php
namespace custom {
	function make_hidden($key, $value, $display = '') {
		if ($display === '') {
			$display = htmlspecialchars($value);
		}
		return '<input type=hidden name="auth[' . htmlspecialchars($key) . ']" value="' . htmlspecialchars($value) . '" />' . $display;
	}

	function adminer_object() {
		final class ForceFillHtmlPlugin extends \Adminer\Plugin {
			private array $constant_values = [
				'driver'   => ['pgsql', 'Postgres'],
				'server'   => ['pg', 'docker-compose'],
				'username' => ['postgres', 'postgres'],
				'password' => ['password', 'password'],
			];

			public function loginFormField($key, $tr, &$input) {
				if ($key === 'db') {
					$script = "document.querySelector('input[type=\"submit\"]').click()";
					return $key . $tr . make_hidden($key, '', '*empty string* ' . \Adminer\script('setTimeout(() => ' . $script . ', 0);'));
				}
				if (key_exists($key, $this->constant_values)) {
					$input = make_hidden($key, $this->constant_values[$key][0], $this->constant_values[$key][1]);
				}

				             // return '<!-- this is form field ' . json_encode(['key' => $key, 'tr' => $tr, 'input' => $input], JSON_UNESCAPED_UNICODE + JSON_PRETTY_PRINT) . ' -->' . PHP_EOL;
				return null; // return null to use original value
			}
		}

		$plugins = [new ForceFillHtmlPlugin()];

		// TODO: load more plugins

		$adminer = new \Adminer\Plugins($plugins);

		return $adminer;
	}
}

namespace {
	if (basename($_SERVER['DOCUMENT_URI'] ?? $_SERVER['REQUEST_URI']) === 'adminer.css' && is_readable('adminer.css')) {
		header('Content-Type: text/css');
		readfile('adminer.css');
		exit;
	}

	$_COOKIE["adminer_permanent"] = 1;

	function adminer_object() {
		return \custom\adminer_object();
	}

	require 'adminer.php';
}
