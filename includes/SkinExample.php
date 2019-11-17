<?php
/**
 * SkinTemplate class for the Example skin
 *
 * @ingroup Skins
 */
class SkinExample extends SkinTemplate {
	private $templateDir = false;
	public $skinname = '<name>',
		$template = 'ExampleTemplate';

	/**
	 * Add CSS via ResourceLoader
	 *
	 * @param $out OutputPage
	 */
	public function initPage( OutputPage $out ) {
		$out->addMeta( 'viewport',
			'width=device-width, initial-scale=1.0, ' .
			'user-scalable=yes, minimum-scale=0.25, maximum-scale=5.0'
		);

		$out->addModuleStyles( [
			'skins.' . $this->skinname
		] );
		$out->addModules( [
			'skins.' . $this->skinname
		] );
	}

	/**
	 * @param string $dir of where templates are located
	 */
	public function setTemplateDirectory( $dir ) {
		$this->templateDir = $dir;
	}

	/**
	 * @return false|string
	 */
	public function getTemplateDirectory() {
		return $this->templateDir;
	}

	/**
	 * @param $out OutputPage
	 */
	function setupSkinUserCss( OutputPage $out ) {
		parent::setupSkinUserCss( $out );
	}
}
